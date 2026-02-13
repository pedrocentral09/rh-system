
const { Client } = require('pg');
require('dotenv').config();

const externalDbUrl = 'postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway';

async function main() {
    const client = new Client({ connectionString: externalDbUrl });
    await client.connect();

    console.log('Searching for standard Type 3 (Punch) records...');
    const { rows } = await client.query('SELECT filename, content FROM afd_files');

    let found = 0;
    for (const file of rows) {
        if (file.content.includes('\n') && file.content.split('\n').some(line => line.charAt(9) === '3')) {
            console.log(`Found standard Type 3 record in file: ${file.filename}`);
            const sample = file.content.split('\n').find(line => line.charAt(9) === '3');
            console.log(`Sample Line (38 chars?): "${sample}" (Length: ${sample.length})`);
            found++;
            break;
        }
        if (found >= 1) break;
    }

    if (found === 0) {
        console.log('No standard Type 3 records found in any file.');
        console.log('Checking all record types present...');
        const typeSet = new Set();
        rows.forEach(f => {
            f.content.split(/\r?\n/).forEach(l => {
                if (l.length >= 10) typeSet.add(l.charAt(9));
            });
        });
        console.log('Record types found:', Array.from(typeSet).sort().join(', '));
    }

    await client.end();
}

main().catch(console.error);
