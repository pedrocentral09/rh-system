
const { Client } = require('pg');
require('dotenv').config();

const externalDbUrl = 'postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway';
const primaryDbUrl = process.env.DATABASE_URL;

async function sync() {
    console.log('--- 🚀 STARTING OPTIMIZED PRODUCTION SYNC ---');

    const pointsClient = new Client({ connectionString: externalDbUrl });
    const employeeClient = new Client({ connectionString: primaryDbUrl });

    try {
        await pointsClient.connect();
        await employeeClient.connect();
        console.log('✅ Connected to both databases.');

        // 1. Get Employees
        const { rows: employees } = await employeeClient.query('SELECT id, name, cpf, pis FROM personnel_employees');
        console.log(`Found ${employees.length} employees in primary DB.`);

        const pisMap = new Map();
        const cpfMap = new Map();
        employees.forEach(emp => {
            if (emp.pis) pisMap.set(emp.pis.replace(/\D/g, ''), emp.id);
            if (emp.cpf) cpfMap.set(emp.cpf.replace(/\D/g, ''), emp.id);
        });

        // 2. Get Existing Record Hashes to skip (PIS_DATE_TIME)
        console.log('Fetching existing record keys to avoid duplicates...');
        const { rows: existingRecs } = await employeeClient.query('SELECT pis, date, time FROM time_records');
        const existingKeys = new Set(existingRecs.map(r => `${r.pis}_${r.date.toISOString().split('T')[0]}_${r.time}`));
        console.log(`Already have ${existingKeys.size} records in DB.`);

        // 3. Get AFD Files
        const { rows: afdFiles } = await pointsClient.query('SELECT filename, content FROM afd_files');
        console.log(`Processing ${afdFiles.length} files...`);

        let totalImported = 0;
        let batch = [];
        const BATCH_SIZE = 500;

        for (const file of afdFiles) {
            const lines = file.content.split(/\r?\n/);

            for (const line of lines) {
                if (line.length < 34 || line.charAt(9) !== '3') continue;

                const nsr = line.substring(0, 9).trim();
                const dateStr = line.substring(10, 18);
                const timeStr = line.substring(18, 22);
                const rawPis = line.substring(22, 34).trim();

                const day = parseInt(dateStr.substring(0, 2));
                const month = parseInt(dateStr.substring(2, 4)) - 1;
                const year = parseInt(dateStr.substring(4, 8));
                const date = new Date(Date.UTC(year, month, day));
                if (isNaN(date.getTime())) {
                    console.error(`  ⚠️ Skipped invalid date: ${dateStr} in file ${file.filename}`);
                    continue;
                }
                const dateIso = date.toISOString().split('T')[0];
                const time = `${timeStr.substring(0, 2)}:${timeStr.substring(2, 4)}`;

                // Skip duplicates
                const key = `${rawPis}_${dateIso}_${time}`;
                if (existingKeys.has(key)) continue;
                existingKeys.add(key);

                // Robust Matching
                const cleanId = rawPis.replace(/\D/g, '');
                let empId = pisMap.get(cleanId);
                if (!empId) {
                    const c1 = cleanId.startsWith('0') ? cleanId.substring(1) : cleanId;
                    if (cpfMap.has(c1)) empId = cpfMap.get(c1);
                }
                if (!empId && cleanId.length >= 11) {
                    const c2 = cleanId.slice(-11);
                    if (cpfMap.has(c2)) empId = cpfMap.get(c2);
                }
                if (!empId) {
                    const asNum = cleanId.replace(/^0+/, '');
                    if (cpfMap.has(asNum)) empId = cpfMap.get(asNum);
                }

                batch.push([
                    Math.random().toString(36).substring(2, 10) + Date.now().toString(36),
                    rawPis,
                    empId || null,
                    dateIso,
                    time,
                    nsr,
                    line.substring(0, 50),
                    false
                ]);

                if (batch.length >= BATCH_SIZE) {
                    await insertBatch(employeeClient, batch);
                    totalImported += batch.length;
                    console.log(`  Imported ${totalImported} records...`);
                    batch = [];
                }
            }
        }

        if (batch.length > 0) {
            await insertBatch(employeeClient, batch);
            totalImported += batch.length;
        }

        console.log(`\n✅ SYNC FINISHED: Total ${totalImported} new records imported.`);

    } catch (e) {
        console.error('❌ FATAL SYNC ERROR:', e);
    } finally {
        await pointsClient.end();
        await employeeClient.end();
    }
}

async function insertBatch(client, batch) {
    if (batch.length === 0) return;
    const placeholders = batch.map((_, i) =>
        `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`
    ).join(', ');

    const query = `INSERT INTO time_records (id, pis, "employeeId", date, time, nsr, "originalLine", "isManual") VALUES ${placeholders}`;
    const values = batch.flat();
    await client.query(query, values);
}

sync();
