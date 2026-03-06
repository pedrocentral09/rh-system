const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const employees = await prisma.employee.findMany({
        include: {
            contract: true,
            vacationPeriods: true
        }
    });

    console.log(`Found ${employees.length} employees.`);

    for (const emp of employees) {
        console.log(`- ${emp.name} (ID: ${emp.id})`);
        console.log(`  Hire Date: ${emp.contract?.admissionDate || 'N/A'}`);
        console.log(`  Vacation Periods: ${emp.vacationPeriods.length}`);
        if (emp.vacationPeriods.length > 0) {
            emp.vacationPeriods.forEach(p => {
                console.log(`    * Period: ${p.startDate.toISOString().split('T')[0]} - ${p.endDate.toISOString().split('T')[0]} Status: ${p.status}`);
            });
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
