const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function timeToMinutes(time) {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

async function main() {
    const targetName = 'MARIA CAROLINA ABADIA DE OLIVEIRA CARVALHO';
    const emp = await prisma.employee.findFirst({ where: { name: targetName } });
    if (!emp) return console.log('Emp not found');

    const date = new Date('2026-02-13T00:00:00Z');

    // Get Scale
    const scale = await prisma.workScale.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date } },
        include: { shiftType: true }
    });

    // Get Records
    const records = await prisma.timeRecord.findMany({
        where: { employeeId: emp.id, date },
        orderBy: { time: 'asc' }
    });

    const punches = records.map(r => r.time);

    console.log(`Simulation for ${emp.name} on ${date.toISOString().split('T')[0]}`);
    console.log(`Punches: ${punches.join(', ')}`);

    if (!scale || !scale.shiftType) {
        console.log('No scale found for this day.');
        return;
    }

    const shift = scale.shiftType;
    console.log(`Shift: ${shift.name} (${shift.startTime} - ${shift.endTime}, break: ${shift.breakDuration}m)`);

    const sStart = timeToMinutes(shift.startTime);
    const sEnd = timeToMinutes(shift.endTime);
    const expectedMinutes = sEnd - sStart - shift.breakDuration;
    console.log(`Expected Minutes: ${expectedMinutes} (${expectedMinutes / 60}h)`);

    let workedMinutes = 0;
    for (let i = 0; i < punches.length; i += 2) {
        if (i + 1 < punches.length) {
            const pStart = timeToMinutes(punches[i]);
            const pEnd = timeToMinutes(punches[i + 1]);
            workedMinutes += (pEnd - pStart);
            console.log(`- Segment ${punches[i]} to ${punches[i + 1]}: ${pEnd - pStart} mins`);
        }
    }

    const balance = workedMinutes - expectedMinutes;
    console.log(`Worked Minutes: ${workedMinutes} (${workedMinutes / 60}h)`);
    console.log(`Balance: ${balance} minutes`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
