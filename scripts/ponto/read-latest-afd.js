const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const externalDbUrl = process.env.RAILWAY_DB_URL;
    const client = new Client(externalDbUrl);

    try {
        await client.connect();

        // Get the most recent file content
        const { rows } = await client.query(
            'SELECT filename, content, created_at FROM afd_files ORDER BY created_at DESC LIMIT 1'
        );

        if (rows.length > 0) {
            console.log(`--- Arquivo: ${rows[0].filename} (${rows[0].created_at}) ---`);
            // Show first 1000 chars and last 1000 chars to avoid memory issues if massive
            const content = rows[0].content;
            if (content.length > 2000) {
                console.log('--- INÍCIO ---');
                console.log(content.substring(0, 1000));
                console.log('\n... [TRUNCATED] ...\n');
                console.log('--- FIM ---');
                console.log(content.substring(content.length - 1000));
            } else {
                console.log(content);
            }
        } else {
            console.log('Nenhum arquivo encontrado.');
        }

    } catch (error) {
        console.error('Erro:', error.message);
    } finally {
        await client.end();
    }
}

main();
