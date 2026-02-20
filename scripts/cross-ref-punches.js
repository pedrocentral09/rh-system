const { Client } = require('pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    const externalDbUrl = process.env.RAILWAY_DB_URL;
    const client = new Client(externalDbUrl);

    try {
        await client.connect();
        const { rows } = await client.query('SELECT content FROM afd_files ORDER BY created_at DESC LIMIT 1');

        if (rows.length > 0) {
            const content = rows[0].content;
            const lines = content.split('\n');
            const today = '19022026';

            const punchersToday = new Set();
            lines.forEach(line => {
                if (line.length >= 34 && line[9] === '3' && line.substring(10, 18) === today) {
                    punchersToday.add(line.substring(22, 34));
                }
            });

            console.log(`--- PIS que bateram ponto HOJE (${today}) ---`);
            console.log(`Total: ${punchersToday.size} pessoas.`);

            // Get all linked PIS from our DB
            const employees = await prisma.employee.findMany({
                where: { status: 'ACTIVE' },
                select: { name: true, pis: true, cpf: true }
            });

            const linkedPIS = new Set();
            employees.forEach(e => {
                if (e.pis) linkedPIS.add(e.pis.replace(/\D/g, '').padStart(12, '0'));
                if (e.cpf) linkedPIS.add(e.cpf.replace(/\D/g, '').padStart(12, '0'));
            });

            console.log('\n--- PIS sem vínculo batendo ponto HOJE ---');
            let foundUnlinked = false;
            for (const pis of punchersToday) {
                if (!linkedPIS.has(pis)) {
                    // check if it matches CPF without leading zero
                    const pisNoZero = pis.replace(/^0+/, '');
                    if (!linkedPIS.has(pisNoZero)) {
                        console.log(`PIS Desconhecido: ${pis}`);
                        foundUnlinked = true;
                    }
                }
            }

            if (!foundUnlinked) console.log('Todos os PIS batendo ponto hoje estão vinculados (ou são Maria Carolina).');

        }
    } catch (error) {
        console.error(error);
    } finally {
        await client.end();
        await prisma.$disconnect();
    }
}

main();
