const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const mariaId = 'c42864a5-f4eb-4245-a872-7ada3455d91f';
    const records = await prisma.timeRecord.findMany({
        where: {
            employeeId: mariaId,
            date: { gte: new Date('2026-02-15') }
        },
        orderBy: { date: 'desc' }
    });

    console.log(`--- Registros recentes de Maria Carolina (Pós 15/02) ---`);
    console.log(JSON.stringify(records, null, 2));

    // Also check if any unlinked records for her PIS exist
    const mariaPIS = '015434802683';
    const unlinked = await prisma.timeRecord.findMany({
        where: {
            employeeId: null,
            pis: { contains: '15434802683' }
        },
        take: 5
    });
    console.log(`\n--- Registros não vinculados para PIS final 15434802683 ---`);
    console.log(JSON.stringify(unlinked, null, 2));
}

main().finally(() => prisma.$disconnect());
