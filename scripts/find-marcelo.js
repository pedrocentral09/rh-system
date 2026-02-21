const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();
        const res = await client.query(`SELECT name, cpf FROM personnel_employees WHERE name ILIKE '%Marcelo%' LIMIT 10`);
        console.log("Found employees:", res.rows);
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
}
run();
