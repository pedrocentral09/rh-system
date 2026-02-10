const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkShifts() {
    try {
        const count = await prisma.shiftType.count();
        console.log(`Total ShiftTypes: ${count}`);
        const shifts = await prisma.shiftType.findMany();
        console.log(shifts);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkShifts();
