
const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
client.connect().then(async () => {
    const res = await client.query('SELECT COUNT(*) FROM time_records WHERE "employeeId" IS NOT NULL');
    console.log('TOTAL LINKED RECORDS:', res.rows[0].count);

    // Check for Maria Carolina specifically
    const mariaRes = await client.query('SELECT COUNT(*) FROM time_records WHERE "employeeId" = $1', ['c42864a5-f4eb-4245-a872-7ada3455d91f']);
    console.log('RECORDS FOR MARIA CAROLINA:', mariaRes.rows[0].count);

    if (parseInt(mariaRes.rows[0].count) > 0) {
        const sample = await client.query('SELECT date, time FROM time_records WHERE "employeeId" = $1 LIMIT 5', ['c42864a5-f4eb-4245-a872-7ada3455d91f']);
        console.log('Sample Punches:', sample.rows);
    }

    await client.end();
}).catch(console.error);
