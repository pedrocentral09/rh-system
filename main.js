const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { Client } = require('pg');

let mainWindow;

// --- Helper Functions ---

function getConfigPath() {
    return path.join(app.getPath('userData'), 'config.json');
}

function loadConfig() {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
    return {
        controlIdIp: '',
        controlIdUser: 'admin',
        controlIdPass: 'admin',
        railwayDbUrl: ''
    };
}

function saveConfig(config) {
    fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2));
}

// --- App Lifecycle ---

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile('index.html');
}

async function executeCollection() {
    const config = loadConfig();
    const log = (msg) => {
        console.log(`[AutoSync] ${msg}`);
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('log-message', msg);
        }
    };

    if (!config.controlIdIp || !config.railwayDbUrl) {
        log("Auto-sync skipped: Missing configuration.");
        return;
    }

    log("Starting automatic collection process...");

    // 1. Login to Device (with Retry)
    let cookie;
    let retries = 3;
    while (retries > 0) {
        try {
            log(`Connecting to device at ${config.controlIdIp} (Attempts left: ${retries})...`);
            const response = await axios.post(`http://${config.controlIdIp}/login.fcgi`, {
                login: config.controlIdUser,
                password: config.controlIdPass
            }, { timeout: 10000 });
            cookie = response.headers['set-cookie'][0];
            log("Device login successful.");
            break;
        } catch (error) {
            retries--;
            log(`Login failed attempt: ${error.message}`);
            if (retries === 0) {
                log(`Final error connecting to device: ${error.message}`);
                return { success: false, message: error.message };
            }
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        }
    }

    // 2. Fetch Data (Yesterday)
    let afdData = [];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const endDate = new Date(yesterday);
    endDate.setHours(23, 59, 59, 999);

    const startTs = Math.floor(yesterday.getTime() / 1000);
    const endTs = Math.floor(endDate.getTime() / 1000);

    try {
        log(`Fetching data for ${yesterday.toISOString().slice(0, 10)}...`);
        const response = await axios.post(`http://${config.controlIdIp}/load_objects.fcgi`, {
            object: "access_logs",
            where: {
                time: { ">=": startTs, "<=": endTs }
            }
        }, { headers: { 'Cookie': cookie }, timeout: 30000 });

        afdData = response.data.access_logs || [];
        log(`Fetched ${afdData.length} records.`);
    } catch (error) {
        log(`Error fetching data: ${error.message}`);
        return { success: false, message: error.message };
    }

    if (afdData.length === 0) {
        log("No data found for yesterday.");
        return { success: true, message: "No data found" };
    }

    // 3. Save Locally
    const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');
    const savePath = path.join(app.getPath('userData'), 'afds');
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true });
    }
    const filePath = path.join(savePath, `afd_${dateStr}.json`);
    fs.writeFileSync(filePath, JSON.stringify(afdData, null, 2));
    log(`Saved locally to ${filePath}`);

    // 4. Upload to DB
    const client = new Client({
        connectionString: config.railwayDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        log("Connecting to Database...");
        await client.connect();

        await client.query(`
            CREATE TABLE IF NOT EXISTS afd_files (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await client.query(
            "INSERT INTO afd_files (filename, content) VALUES ($1, $2)",
            [path.basename(filePath), fs.readFileSync(filePath, 'utf8')]
        );
        log("Upload to Database successful!");
    } catch (error) {
        log(`Database Error: ${error.message}`);
        return { success: false, message: error.message };
    } finally {
        await client.end();
    }

    return { success: true };
}

function setupTimers() {
    // Run every 5 minutes
    setInterval(() => {
        executeCollection();
    }, 5 * 60 * 1000);

    // Initial run after 1 minute
    setTimeout(() => {
        executeCollection();
    }, 60 * 1000);
}

app.whenReady().then(() => {
    createWindow();
    setupTimers();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// --- IPC Handlers (Backend Logic) ---

ipcMain.handle('load-config', async () => {
    return loadConfig();
});

ipcMain.handle('save-config', async (event, config) => {
    saveConfig(config);
    return { success: true };
});

ipcMain.handle('test-connection', async (event, config) => {
    const results = { device: false, db: false, errors: [] };

    // Test Control iD
    try {
        await axios.post(`http://${config.controlIdIp}/login.fcgi`, {
            login: config.controlIdUser,
            password: config.controlIdPass
        }, { timeout: 5000 });
        results.device = true;
    } catch (error) {
        results.errors.push(`Device Error: ${error.message}`);
    }

    // Test Railway DB
    const client = new Client({
        connectionString: config.railwayDbUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        await client.query('SELECT NOW()');
        results.db = true;
    } catch (error) {
        results.errors.push(`DB Error: ${error.message}`);
    } finally {
        await client.end();
    }

    return results;
});

ipcMain.handle('run-collection', async (event) => {
    return executeCollection();
});
