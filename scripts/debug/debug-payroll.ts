
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Inspecting Employee Data for Payroll...');

    const employees = await prisma.employee.findMany({
        include: {
            contract: true
        }
    });

    console.log(`found ${employees.length} total employees.`);

    for (const emp of employees) {
        console.log(`--------------------------------------------------`);
        console.log(`Name: ${emp.name}`);
        console.log(`ID: ${emp.id}`);
        console.log(`Status: '${emp.status}' (Expected: 'ACTIVE')`);
        console.log(`Contract: ${emp.contract ? '✅ Found' : '❌ MISSING'}`);

        if (emp.contract) {
            console.log(`   Base Salary: ${emp.contract.baseSalary}`);
            console.log(`   Admission: ${emp.contract.admissionDate}`);
        } else {
            console.log(`   ⚠️ This employee will be SKIPPED by Payroll because they have no contract.`);
        }
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
