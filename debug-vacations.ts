
import { prisma } from './src/lib/prisma';
import { checkVacationRights } from './src/modules/vacations/actions';

async function main() {
    console.log("Starting Debug Vacation Sync...");

    const employees = await prisma.employee.findMany();
    console.log(`Found ${employees.length} employees total.`);

    const active = employees.filter(e => e.status === 'ACTIVE');
    console.log(`Found ${active.length} ACTIVE employees.`);

    for (const emp of active) {
        console.log(`Checking rights for: ${emp.name} (${emp.id})`);
        // We can't import server actions directly if they assume Next.js context sometimes, 
        // but checkVacationRights is pure Prisma usually.
        // Let's copy paste the logic here to be safe if imports fail, or try to import.
        // Importing actions.ts might fail due to 'use server'.
        // So I will implement a local version of check logic here to test.

        const contract = await prisma.contract.findUnique({ where: { employeeId: emp.id } });
        if (!contract) {
            console.log(`  No contract found for ${emp.name}`);
            continue;
        }

        if (!contract.admissionDate) {
            console.log(`  No admission date for ${emp.name}`);
            continue;
        }

        console.log(`  Admission: ${contract.admissionDate}`);

        // Call the REAL logic via import if possible, or replicate to see why loop fails.
        // Actually, let's try calling the real one via a temporary test endpoint or just replicate logic roughly.
        // Replicating logic for debug:

        const admission = new Date(contract.admissionDate);
        const now = new Date();
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + 1);

        let cursor = new Date(admission);
        let count = 0;

        // Simple loop check
        while (cursor < checkDate && count < 50) {
            const periodEnd = new Date(cursor);
            periodEnd.setFullYear(periodEnd.getFullYear() + 1);

            console.log(`    Period: ${cursor.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`);

            cursor = periodEnd;
            count++;
        }
    }
}

main();
