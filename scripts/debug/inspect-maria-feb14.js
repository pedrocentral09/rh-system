const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const targetName = 'MARIA CAROLINA ABADIA DE OLIVEIRA CARVALHO';
    const emp = await prisma.employee.findFirst({
        where: { name: targetName }
    });

    if (!emp) {
        console.log('Employee not found');
        return;
    }

    console.log(`Checking scales for ${emp.name} (${emp.id})`);
    
    // Find all scales for this employee around mid-February
    const scales = await prisma.workScale.findMany({
        where: { 
            employeeId: emp.id,
            date: {
                gte: new Date('2026-02-12T00:00:00Z'),
                lte: new Date('2026-02-16T23:59:59Z')
            }
        },
        include: { shiftType: true },
        orderBy: { date: 'asc' }
    });

    console.log(`Found ${scales.length} records:`);
    scales.forEach(s => {
        console.log(`- Date: ${s.date.toISOString()} | Shift: ${s.shiftType ? s.shiftType.name : 'FOLGA'} (ID: ${s.shiftTypeId}) | ID: ${s.id}`);
    });

    // Check if there are any other shift types with similar names that might be causing confusion
    const allShifts = await prisma.shiftType.findMany();
    console.log('\nAvailable Shift Types:');
    allShifts.forEach(st => {
        console.log(`- ${st.name} (ID: ${st.id})`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
