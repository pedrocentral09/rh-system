import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const records = await prisma.timeRecord.findMany({
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log('Found', records.length, 'records.');
    records.forEach(r => {
        console.log(`ID: ${r.id}, Employee: ${r.employeeId}, Date: ${r.date.toISOString()} (Local: ${r.date.toLocaleString()}), Time: ${r.time}, Manual: ${r.isManual}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
