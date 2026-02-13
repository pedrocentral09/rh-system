require('dotenv').config();
process.env.DATABASE_URL = process.env.RAILWAY_DB_URL;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Connecting to DB...');
    console.log('URL Host:', process.env.DATABASE_URL.split('@')[1]);
    try {
        // raw query to list tables in postgres
        const result = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log('Tables found:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
