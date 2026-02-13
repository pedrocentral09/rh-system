
const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function main() {
    await client.connect();

    console.log('--- 📋 DATABASE SCAN: TABLES ACROSS ALL SCHEMAS ---');

    const res = await client.query(`
    SELECT table_schema, table_name 
    FROM information_schema.tables 
    WHERE table_schema NOT IN ('information_schema', 'pg_catalog') 
    ORDER BY table_schema, table_name;
  `);

    if (res.rows.length === 0) {
        console.log('No tables found in the entire database.');
    } else {
        res.rows.forEach(row => {
            console.log(`- ${row.table_schema}.${row.table_name}`);
        });
    }

    const employeeTable = res.rows.find(r => r.table_name === 'personnel_employees');
    if (employeeTable) {
        console.log(`\n✅ Found employee table: ${employeeTable.table_schema}.${employeeTable.table_name}`);
        const countRes = await client.query(`SELECT COUNT(*) FROM ${employeeTable.table_schema}.${employeeTable.table_name}`);
        console.log(`Total employees: ${countRes.rows[0].count}`);

        const sampleEmp = await client.query(`SELECT id, name, cpf, pis FROM ${employeeTable.table_schema}.${employeeTable.table_name} LIMIT 1`);
        console.log('Sample Employee:', sampleEmp.rows[0]);
    } else {
        console.log('\n❌ Table "personnel_employees" not found anywhere.');
    }

    const afdTable = res.rows.find(r => r.table_name === 'afd_files');
    if (afdTable) {
        console.log(`\n✅ Found AFD table: ${afdTable.table_schema}.${afdTable.table_name}`);
        const countRes = await client.query(`SELECT COUNT(*) FROM ${afdTable.table_schema}.${afdTable.table_name}`);
        console.log(`Total files in afd_files: ${countRes.rows[0].count}`);
    }

    await client.end();
}

main().catch(e => {
    console.error('❌ SCAN ERROR:', e);
    process.exit(1);
});
