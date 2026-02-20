const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const externalDbUrl = process.env.RAILWAY_DB_URL;
    const client = new Client(externalDbUrl);

    try {
        await client.connect();
        const { rows } = await client.query('SELECT content FROM afd_files ORDER BY created_at DESC LIMIT 1');

        if (rows.length > 0) {
            const content = rows[0].content;
            const lines = content.split('\n');

            const pisCounts = {};
            lines.forEach(line => {
                // Punch line: NSR(9) + Type(1) + Date(8) + Time(4) + PIS(12)
                if (line.length >= 34 && line[9] === '3') {
                    const pis = line.substring(22, 34);
                    pisCounts[pis] = (pisCounts[pis] || 0) + 1;
                }
            });

            const sortedPIS = Object.entries(pisCounts).sort((a, b) => b[1] - a[1]);

            console.log('--- Top 20 PIS no arquivo AFD ---');
            sortedPIS.slice(0, 20).forEach(([pis, count]) => {
                console.log(`${pis}: ${count} batidas`);
            });
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
