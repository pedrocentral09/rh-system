require('dotenv').config();
process.env.DATABASE_URL = process.env.RAILWAY_DB_URL;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cpf = '154.348.026-83';
    console.log(`Checking for CPF: ${cpf}`);
    try {
        const employee = await prisma.employee.findUnique({
            where: { cpf },
            include: { address: true, contract: true }
        });
        if (employee) {
            console.log('FOUND EMPLOYEE:', JSON.stringify(employee, null, 2));
        } else {
            console.log('EMPLOYEE NOT FOUND');
        }
    } catch (error) {
        console.error('ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
