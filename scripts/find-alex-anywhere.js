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
            const searchTerm = 'ALEX';

            console.log(`--- Buscando '${searchTerm}' em todo o arquivo ---`);
            const matchedLines = lines.filter(l => l.toUpperCase().includes(searchTerm));

            console.log(`Encontradas ${matchedLines.length} linhas.`);
            matchedLines.forEach(l => console.log(l.trim()));
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
