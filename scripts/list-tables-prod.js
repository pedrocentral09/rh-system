require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    await client.connect();

    console.log('--- 📋 PRODUCTION TABLES ---');

    const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);

    if (res.rows.length === 0) {
        console.log('No tables found in public schema.');
    } else {
        res.rows.forEach(row => {
            console.log(`- ${row.table_name}`);
        });
    }

    await client.end();
}

main().catch(e => console.error(e));
