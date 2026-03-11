const { Client } = require('pg');
require('dotenv').config();

async function main() {
    const externalDbUrl = process.env.RAILWAY_DB_URL;
    if (!externalDbUrl) {
        console.error('RAILWAY_DB_URL not found in .env');
        return;
    }

    const client = new Client(externalDbUrl);

    try {
        await client.connect();
        console.log('--- Conectado ao Banco Externo (AFD Source) ---');

        const { rows: files } = await client.query(
            'SELECT id, filename, created_at FROM afd_files ORDER BY created_at DESC LIMIT 10'
        );

        console.log('\n--- Últimos Arquivos no Banco Externo ---');
        console.table(files);

        const { rows: count } = await client.query('SELECT COUNT(*) FROM afd_files');
        console.log(`\nTotal de arquivos no banco externo: ${count[0].count}`);

    } catch (error) {
        console.error('Erro ao conectar ou consultar banco externo:', error.message);
    } finally {
        await client.end();
    }
}

main();
