const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking Recent Time Records (Feb 13-14) ---');

    const records = await prisma.timeRecord.findMany({
        where: {
            date: {
                gte: new Date('2026-02-13T00:00:00Z'),
                lte: new Date('2026-02-14T23:59:59Z')
            }
        },
        orderBy: [
            { date: 'asc' },
            { time: 'asc' }
        ],
        include: {
            employee: {
                select: { name: true }
            }
        }
    });

    console.log(`Found ${records.length} records in this range.`);
    records.forEach(r => {
        const empName = r.employee ? r.employee.name : 'Unknown';
        console.log(`${r.date.toISOString().split('T')[0]} | ${r.time} | PIS: ${r.pis} | Emp: ${empName}`);
    });

    console.log('\n--- Checking Import Logs ---');
    const imports = await prisma.timeClockFile.findMany({
        orderBy: { uploadDate: 'desc' },
        take: 5
    });

    imports.forEach(i => {
        console.log(`${i.uploadDate.toISOString()} | File: ${i.fileName} | Status: ${i.status}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
