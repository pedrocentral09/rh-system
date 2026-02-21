
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = await prisma.payrollEvent.findMany();
    console.log('Payroll Events:');
    events.forEach(e => {
        console.log(`[${e.code}] ${e.name} (${e.type})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
