const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Most Recent Punches by Logical Date/Time ---');
    const records = await prisma.timeRecord.findMany({
        orderBy: [
            { date: 'desc' },
            { time: 'desc' }
        ],
        take: 30,
        include: {
            employee: { select: { name: true } }
        }
    });

    records.forEach(r => {
        const empName = r.employee ? r.employee.name : 'Unknown';
        console.log(`${r.date.toISOString().split('T')[0]} ${r.time} | PIS: ${r.pis} | Emp: ${empName}`);
    });
}

main().finally(() => prisma.$disconnect());
