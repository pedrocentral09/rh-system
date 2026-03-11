const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Checking ReportTemplates ---');
    try {
        const count = await prisma.reportTemplate.count();
        console.log('Count:', count);
        const all = await prisma.reportTemplate.findMany();
        console.log('All:', JSON.stringify(all, null, 2));
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
