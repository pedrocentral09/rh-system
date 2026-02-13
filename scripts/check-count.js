
const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
    const res = await client.query('SELECT COUNT(*) FROM time_records');
    console.log('TOTAL RECORDS:', res.rows[0].count);
    await client.end();
}).catch(console.error);
