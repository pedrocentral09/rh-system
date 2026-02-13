const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Listing Active Employees ---');

    // 1. Find all active employees to help user identify the correct one
    const emps = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true }
    });

    console.log(`Found ${emps.length} active employees:`);
    emps.forEach(e => console.log(`- ${e.name} (${e.id})`));

    const targetName = 'Maria Carolina';
    const found = emps.filter(e => e.name.toLowerCase().includes(targetName.toLowerCase()));

    if (found.length === 0) {
        console.log(`\nNo employee found containing "${targetName}".`);
    } else {
        console.log(`\nResults for "${targetName}":`);
        for (const emp of found) {
            console.log(`\nInvestigating: ${emp.name} (${emp.id})`);
            const scales = await prisma.workScale.findMany({
                where: { employeeId: emp.id },
                orderBy: { date: 'asc' }
            });
            console.log(`Total Scale Records: ${scales.length}`);

            // Check for duplicates
            const dayMap = new Map();
            const duplicates = [];
            scales.forEach(s => {
                const dateStr = s.date.toISOString().split('T')[0];
                if (dayMap.has(dateStr)) {
                    duplicates.push({ date: dateStr, first: dayMap.get(dateStr).id, second: s.id });
                }
                dayMap.set(dateStr, s);
            });
            if (duplicates.length > 0) console.log('Duplicates found:', duplicates);
            else console.log('No duplicates found.');
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
