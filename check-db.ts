
import { prisma } from './src/lib/prisma';

async function main() {
    console.log("Checking Database Records...");

    // Check Employees
    const empCount = await prisma.employee.count();
    console.log(`Employees: ${empCount}`);

    // Check Vacation Periods
    const periodCount = await prisma.vacationPeriod.count();
    console.log(`Vacation Periods: ${periodCount}`);

    if (periodCount === 0 && empCount > 0) {
        console.log("No periods found! Attempting data dump from first employee...");
        const emp = await prisma.employee.findFirst({ include: { contract: true } });
        console.log("Sample Employee:", emp?.name);
        console.log("Admission:", emp?.contract?.admissionDate);
    } else {
        const samples = await prisma.vacationPeriod.findMany({ take: 3 });
        console.log("Sample Periods:", samples);
    }
}

main();
