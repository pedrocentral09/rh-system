import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const dateStr = "2026-02-01";
    const [y, m, d] = dateStr.split('-').map(Number);
    const queryDate = new Date(y, m - 1, d);

    console.log('Query Date (Local):', queryDate.toString());
    console.log('Query Date (ISO):', queryDate.toISOString());

    const records = await prisma.timeRecord.findMany({
        where: { date: queryDate }
    });

    console.log(`Found ${records.length} records for ${dateStr}.`);

    // Check specific employee
    const employees = await prisma.employee.findMany();
    console.log(`Found ${employees.length} employees.`);

    if (employees.length > 0 && records.length > 0) {
        const emp = employees[0];
        const empRecords = records.filter(r => r.employeeId === emp.id);
        console.log(`Employee ${emp.name} (${emp.id}) has ${empRecords.length} records.`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
