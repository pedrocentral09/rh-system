const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { Client } = require('pg');
const open = require('open');

const app = express();
const PORT = process.env.PORT || 3001;
const CONFIG_FILE = 'config.json';
const LOCAL_SAVE_PATH = './afds';

app.use(bodyParser.json());
app.use(express.static('public'));

// --- Helpers ---

function loadConfig() {
    if (fs.existsSync(CONFIG_FILE)) {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
    return {
        controlIdIp: '192.168.1.200',
        controlIdUser: 'admin',
        controlIdPass: 'admin',
        railwayDbUrl: ''
    };
}

function saveConfig(config) {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function log(msg) {
    const time = new Date().toLocaleTimeString();
    console.log(`[${time}] ${msg}`);
    return `[${time}] ${msg}`;
}

// --- Routes ---

app.get('/api/config', (req, res) => {
    res.json(loadConfig());
});

app.post('/api/config', (req, res) => {
    saveConfig(req.body);
    res.json({ success: true });
});

app.post('/api/test', async (req, res) => {
    const config = req.body;
    const results = { device: false, db: false, errors: [] };

    const https = require('https');
    const agent = new https.Agent({ rejectUnauthorized: false });

    // Test Device
    try {
        await axios.post(`https://${config.controlIdIp}/login.fcgi`, {
            login: config.controlIdUser,
            password: config.controlIdPass
        }, { timeout: 5000, httpsAgent: agent });
        results.device = true;
    } catch (error) {
        results.errors.push(`Device Error: ${error.message}`);
    }

    // Test DB
    if (!config.railwayDbUrl) {
        results.errors.push("DB Error: URL is empty");
    } else {
        const client = new Client({
            connectionString: config.railwayDbUrl,
            ssl: { rejectUnauthorized: false }
        });
        try {
            await client.connect();
            await client.query('SELECT NOW()');
            results.db = true;
            await client.end();
        } catch (error) {
            results.errors.push(`DB Error: ${error.message}`);
        }
    }

    res.json(results);
});

app.post('/api/run', async (req, res) => {
    const config = loadConfig();
    const logs = [];
    const addLog = (msg) => logs.push(log(msg));

    addLog("Starting process...");

    try {
        const https = require('https');
        const agent = new https.Agent({ rejectUnauthorized: false });

        // 1. Login
        addLog(`Connecting to ${config.controlIdIp}...`);
        const loginRes = await axios.post(`https://${config.controlIdIp}/login.fcgi`, {
            login: config.controlIdUser,
            password: config.controlIdPass
        }, { timeout: 10000, httpsAgent: agent });
        const cookie = loginRes.headers['set-cookie'][0];
        addLog("Login successful.");

        // 2. Fetch Data (Yesterday)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const endDate = new Date(yesterday);
        endDate.setHours(23, 59, 59, 999);

        const startTs = Math.floor(yesterday.getTime() / 1000);
        const endTs = Math.floor(endDate.getTime() / 1000);

        addLog(`Fetching data for ${yesterday.toISOString().slice(0, 10)}...`);
        const dataRes = await axios.post(`https://${config.controlIdIp}/load_objects.fcgi`, {
            object: "access_logs",
            where: { time: { ">=": startTs, "<=": endTs } }
        }, { headers: { 'Cookie': cookie }, timeout: 30000, httpsAgent: agent });

        const records = dataRes.data.access_logs || [];
        addLog(`Found ${records.length} records.`);

        if (records.length > 0) {
            // 3. Save Local
            if (!fs.existsSync(LOCAL_SAVE_PATH)) fs.mkdirSync(LOCAL_SAVE_PATH, { recursive: true });
            const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
            const filename = `afd_${dateStr}.json`;
            const filepath = path.join(LOCAL_SAVE_PATH, filename);
            fs.writeFileSync(filepath, JSON.stringify(records, null, 2));
            addLog(`Saved to ${filename}`);

            // 4. Upload DB
            addLog("Uploading to Database...");
            const client = new Client({
                connectionString: config.railwayDbUrl,
                ssl: { rejectUnauthorized: false }
            });
            await client.connect();
            await client.query(`CREATE TABLE IF NOT EXISTS afd_files (id SERIAL PRIMARY KEY, filename VARCHAR(255), content TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`);
            await client.query("INSERT INTO afd_files (filename, content) VALUES ($1, $2)", [filename, fs.readFileSync(filepath, 'utf8')]);
            await client.end();
            addLog("Upload successful!");
        } else {
            addLog("Skipping save/upload (no data).");
        }

        res.json({ success: true, logs });

    } catch (error) {
        addLog(`ERROR: ${error.message}`);
        res.json({ success: false, logs, error: error.message });
    }
});

app.listen(PORT, async () => {
    console.log(`Server running at http://localhost:${PORT}`);
    // Open browser automatically
    const open = (await import('open')).default;
    open(`http://localhost:${PORT}`);
});
