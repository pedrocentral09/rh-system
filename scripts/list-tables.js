require('dotenv').config();
process.env.DATABASE_URL = process.env.RAILWAY_DB_URL;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    try {
        // raw query to list tables in postgres
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables found:', result);

        // Also try to simpler user query
        try {
            const count = await prisma.user.count();
            console.log('User count (Prisma):', count);
        } catch (err) {
            console.log('Prisma User query failed:', err.message);
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
