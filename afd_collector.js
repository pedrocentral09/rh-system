require('dotenv').config();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration
const CONTROLID_IP = process.env.CONTROLID_IP;
const CONTROLID_USER = process.env.CONTROLID_USER;
const CONTROLID_PASS = process.env.CONTROLID_PASS;
const RAILWAY_DB_URL = process.env.AFD_DATABASE_URL || process.env.RAILWAY_DB_URL;
const LOCAL_SAVE_PATH = process.env.LOCAL_SAVE_PATH || './afds';

// Setup logging
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);
const logError = (msg) => console.error(`[${new Date().toISOString()}] ERROR: ${msg}`);

async function getSession() {
    const loginUrl = `http://${CONTROLID_IP}/login.fcgi`;
    try {
        const response = await axios.post(loginUrl, {
            login: CONTROLID_USER,
            password: CONTROLID_PASS
        }, { timeout: 10000 });

        const cookie = response.headers['set-cookie'][0];
        log("Login successful");
        return cookie;
    } catch (error) {
        logError(`Failed to login: ${error.message}`);
        throw error;
    }
}

async function fetchAfdData(cookie, startDate, endDate) {
    const url = `http://${CONTROLID_IP}/load_objects.fcgi`;

    // Convert dates to unix timestamp
    const startTs = Math.floor(startDate.getTime() / 1000);
    const endTs = Math.floor(endDate.getTime() / 1000);

    const payload = {
        object: "access_logs",
        where: {
            time: {
                ">=": startTs,
                "<=": endTs
            }
        }
    };

    try {
        const response = await axios.post(url, payload, {
            headers: { 'Cookie': cookie },
            timeout: 30000
        });

        return response.data.access_logs || [];
    } catch (error) {
        logError(`Failed to fetch data: ${error.message}`);
        throw error;
    }
}

function saveLocalAfd(data, dateStr) {
    if (!fs.existsSync(LOCAL_SAVE_PATH)) {
        fs.mkdirSync(LOCAL_SAVE_PATH, { recursive: true });
    }

    const filename = `afd_${dateStr}.json`;
    const filepath = path.join(LOCAL_SAVE_PATH, filename);

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    log(`Saved ${data.length} records to ${filepath}`);
    return filepath;
}

async function uploadToRailway(filepath) {
    const client = new Client({
        connectionString: RAILWAY_DB_URL,
        ssl: { rejectUnauthorized: false } // Required for Railway
    });

    try {
        await client.connect();

        // Create table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS afd_files (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                content TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        const content = fs.readFileSync(filepath, 'utf8');
        const filename = path.basename(filepath);

        await client.query(
            "INSERT INTO afd_files (filename, content) VALUES ($1, $2)",
            [filename, content]
        );

        log(`Uploaded ${filename} to Railway DB`);
    } catch (error) {
        logError(`Database error: ${error.message}`);
        throw error;
    } finally {
        await client.end();
    }
}

async function main() {
    // Define date range (e.g., yesterday)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const endDate = new Date(yesterday);
    endDate.setHours(23, 59, 59, 999);

    const dateStr = yesterday.toISOString().slice(0, 10).replace(/-/g, '');

    log(`Starting collection for ${dateStr}`);

    try {
        const cookie = await getSession();
        const data = await fetchAfdData(cookie, yesterday, endDate);

        if (data && data.length > 0) {
            const filepath = saveLocalAfd(data, dateStr);
            await uploadToRailway(filepath);
        } else {
            log("No data found for this period.");
        }
    } catch (error) {
        logError("Process failed");
        process.exit(1);
    }
}

main();
