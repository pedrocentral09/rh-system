const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing Career Paths table...');
        const paths = await prisma.careerPath.findMany();
        console.log('Success! Found paths:', paths.length);
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
