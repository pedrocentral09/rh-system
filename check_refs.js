const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRefs() {
    try {
        const counts = {
            companies: await prisma.company.count(),
            stores: await prisma.store.count(),
            jobRoles: await prisma.jobRole.count(),
            sectors: await prisma.sector.count(),
            shiftTypes: await prisma.shiftType.count(),
        };
        console.log(counts);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkRefs();
