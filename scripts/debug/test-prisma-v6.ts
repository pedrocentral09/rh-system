
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma v6 Connection...');
    try {
        const count = await prisma.user.count();
        console.log('Successfully connected! User count:', count);
    } catch (e) {
        console.error('Prisma Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
