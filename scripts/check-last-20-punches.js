const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Most Recent 20 Punches in System ---');
    const records = await prisma.timeRecord.findMany({
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            employee: { select: { name: true } }
        }
    });

    records.forEach(r => {
        const empName = r.employee ? r.employee.name : 'Unknown';
        console.log(`[Synced at ${r.createdAt.toISOString()}] ${r.date.toISOString().split('T')[0]} ${r.time} | PIS: ${r.pis} | Emp: ${empName}`);
    });
}

main().finally(() => prisma.$disconnect());
