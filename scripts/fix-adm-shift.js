const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Correcting ADM Shift ---');
    const res = await prisma.shiftType.updateMany({
        where: { name: 'ADM' },
        data: { breakDuration: 60 }
    });
    console.log(`Updated ${res.count} ADM shifts.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
