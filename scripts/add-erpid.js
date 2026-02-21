const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        console.log('Connected');
        await client.query('ALTER TABLE core_stores ADD COLUMN IF NOT EXISTS "erpId" TEXT');
        console.log('Column erpId added to core_stores');
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
