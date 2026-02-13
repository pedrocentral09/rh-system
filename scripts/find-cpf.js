
const { Client } = require('pg');
require('dotenv').config();

const externalDbUrl = 'postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway';

async function main() {
    const client = new Client({ connectionString: externalDbUrl });
    await client.connect();

    console.log('Searching for CPF "15434802683" or "015434802683"...');
    const { rows } = await client.query('SELECT filename, content FROM afd_files');

    let totalFound = 0;
    for (const file of rows) {
        if (file.content.includes('15434802683')) {
            totalFound++;
            console.log(`\nFOUND IN: ${file.filename}`);
            const lines = file.content.split(/\r?\n/);
            const matches = lines.filter(l => l.includes('15434802683'));
            console.log(`Matches (${matches.length}):`);
            matches.slice(0, 3).forEach(m => console.log(`  - ${m} (Length: ${m.length})`));
        }
    }

    if (totalFound === 0) {
        console.log('\n❌ CPF not found in any of the 596 files.');
    } else {
        console.log(`\n✅ Total files with matches: ${totalFound}`);
    }

    await client.end();
}

main().catch(console.error);
