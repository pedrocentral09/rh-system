const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const emps = await prisma.employee.findMany({
        where: {
            OR: [
                { name: { contains: 'Maria Carolina', mode: 'insensitive' } },
                { name: { contains: 'Alex', mode: 'insensitive' } }
            ]
        },
        select: { id: true, name: true, pis: true, cpf: true, status: true }
    });

    console.log('--- Colaboradores Encontrados ---');
    console.log(JSON.stringify(emps, null, 2));

    // Also check time records for these IDs if found
    const empIds = emps.map(e => e.id);
    const records = await prisma.timeRecord.findMany({
        where: { employeeId: { in: empIds } },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('\n--- Últimos Registros de Ponto Vinculados ---');
    console.log(JSON.stringify(records, null, 2));

    // check if there are any records with NO employeeId but that might belong to them (checking PIS/CPF)
    const pisList = emps.map(e => e.pis).filter(Boolean);
    const orphanRecords = await prisma.timeRecord.findMany({
        where: {
            employeeId: null,
            pis: { in: pisList }
        },
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('\n--- Registros Órfãos (com PIS correspondente mas sem vínculo) ---');
    console.log(JSON.stringify(orphanRecords, null, 2));

    const files = await prisma.timeClockFile.findMany({
        orderBy: { uploadDate: 'desc' },
        take: 10
    });

    console.log('\n--- Últimos Arquivos de Ponto Processados ---');
    console.log(JSON.stringify(files, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
