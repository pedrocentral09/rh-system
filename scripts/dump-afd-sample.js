
const { Client } = require('pg');
require('dotenv').config();

const externalDbUrl = 'postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway';

async function main() {
    const client = new Client({ connectionString: externalDbUrl });
    await client.connect();

    const { rows } = await client.query('SELECT filename, content FROM afd_files LIMIT 1');
    if (rows.length > 0) {
        console.log('--- FILE:', rows[0].filename, '---');
        console.log('CONTENT START (100 chars):');
        console.log(rows[0].content.substring(0, 100));
        console.log('\nFULL LINE 1:');
        console.log(rows[0].content.split(/\r?\n/)[0]);
        console.log('\nFULL LINE 2:');
        console.log(rows[0].content.split(/\r?\n/)[1]);
        console.log('\nFULL LINE 3:');
        console.log(rows[0].content.split(/\r?\n/)[2]);
    } else {
        console.log('No files found.');
    }

    await client.end();
}

main().catch(console.error);
