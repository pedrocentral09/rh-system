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

            console.log('--- Buscando nomes no arquivo AFD (Tipo 5) ---');
            // Record type 5 contains names: NSR(9) + 5 + Date(8) + Time(4) + PIS(12) + Name(52)
            const nameLines = lines.filter(l => l[9] === '5' && (
                l.includes('ALEX') || l.includes('MENDES') || l.includes('JUNIOR') || l.includes('MARIA')
            ));

            nameLines.forEach(l => {
                const pis = l.substring(22, 34);
                const name = l.substring(34).trim();
                console.log(`PIS: ${pis} | Nome: ${name}`);
            });

            if (nameLines.length === 0) {
                console.log('Nenhum registro de nome (Tipo 5) encontrado com esses termos.');
                // Try searching the whole file for the string ALEX
                const anyAlex = lines.filter(l => l.includes('ALEX'));
                console.log(`\nMenções genéricas a 'ALEX': ${anyAlex.length}`);
                anyAlex.slice(0, 5).forEach(l => console.log(l));
            }
        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
    }
}

main();
