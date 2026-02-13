
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    await client.connect();

    console.log('--- 📋 COLUMNS IN afd_files ---');

    const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'afd_files'
    ORDER BY ordinal_position;
  `);

    res.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
    });

    // Also check if there are any rows
    const countRes = await client.query('SELECT COUNT(*) FROM afd_files');
    console.log(`\nTotal rows in afd_files: ${countRes.rows[0].count}`);

    if (parseInt(countRes.rows[0].count) > 0) {
        console.log('\n--- Sample Data (First Row) ---');
        const sampleRes = await client.query('SELECT * FROM afd_files LIMIT 1');
        console.log(JSON.stringify(sampleRes.rows[0], null, 2));
    }

    await client.end();
}

main().catch(e => console.error(e));
