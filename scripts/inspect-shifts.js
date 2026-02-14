const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Shift Type Inspection ---');
    const shifts = await prisma.shiftType.findMany({
        where: {
            name: {
                in: ['ADM', 'ADM SAB']
            }
        }
    });

    shifts.forEach(s => {
        console.log(`Name: ${s.name}`);
        console.log(`- ID: ${s.id}`);
        console.log(`- Start: ${s.startTime}`);
        console.log(`- End: ${s.endTime}`);
        console.log(`- Break Duration: ${s.breakDuration} minutes`);

        const [h1, m1] = s.startTime.split(':').map(Number);
        const [h2, m2] = s.endTime.split(':').map(Number);
        const totalMins = (h2 * 60 + m2) - (h1 * 60 + m1);
        const expectedWork = totalMins - s.breakDuration;

        console.log(`- Math: (${totalMins} total mins) - (${s.breakDuration} break) = ${expectedWork} expected work mins (${expectedWork / 60} hours)`);
        console.log('---------------------------');
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
