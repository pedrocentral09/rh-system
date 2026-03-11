import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function checkUsers() {
    console.log('--- DATABASE URL used:', process.env.DATABASE_URL);
    try {
        const users = await prisma.user.findMany();
        console.log('--- USERS IN DB ---');
        console.log(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error('❌ Error querying users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
