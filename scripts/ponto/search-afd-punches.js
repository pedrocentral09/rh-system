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
            const alexPIS = '21350655556';
            const mariaPIS = '015434802683';

            console.log(`--- Busca no arquivo AFD ---`);
            const alexLines = lines.filter(l => l.includes(alexPIS));
            console.log(`Alex (${alexPIS}): ${alexLines.length} registros encontrados.`);
            alexLines.slice(-5).forEach(l => console.log(l));

            const mariaLines = lines.filter(l => l.includes(mariaPIS));
            console.log(`\nMaria (${mariaPIS}): ${mariaLines.length} registros encontrados.`);
            mariaLines.slice(-5).forEach(l => console.log(l));
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
