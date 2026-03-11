const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- 📋 ULTIMAS 20 BATIDAS NO BANCO ---');
    const records = await prisma.timeRecord.findMany({
        take: 20,
        orderBy: { date: 'desc' },
        include: { employee: { select: { name: true } } }
    });

    records.forEach(r => {
        console.log(`[${r.date.toISOString().split('T')[0]}] ${r.time} - ${r.employee?.name || r.pis} (NSR: ${r.nsr})`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
