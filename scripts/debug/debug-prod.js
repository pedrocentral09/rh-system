
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- 🔍 PRODUCTION DEBUG: EMPLOYEES & TIME RECORDS ---');

    // 1. Find Maria Carolina
    const employees = await prisma.employee.findMany({
        where: { name: { contains: 'Maria', mode: 'insensitive' } },
        select: { id: true, name: true, pis: true, cpf: true }
    });

    console.log(`\nFound ${employees.length} employees matching "Maria":`);
    employees.forEach(emp => {
        console.log(`- [${emp.name}]`);
        console.log(`  ID: ${emp.id}`);
        console.log(`  PIS: '${emp.pis}' (Clean: '${(emp.pis || '').replace(/\D/g, '')}')`);
        console.log(`  CPF: '${emp.cpf}' (Clean: '${(emp.cpf || '').replace(/\D/g, '')}')`);
    });

    // 2. Check Recent Imports
    console.log('\n--- 📂 RECENT UPLOADS ---');
    const files = await prisma.timeClockFile.findMany({
        take: 5,
        orderBy: { uploadDate: 'desc' },
        include: { _count: { select: { records: true } } }
    });

    if (files.length === 0) {
        console.log('No files uploaded yet.');
    } else {
        files.forEach(f => {
            console.log(`File: ${f.fileName}`);
            console.log(`  Status: ${f.status}`);
            console.log(`  Records Created: ${f._count.records}`);
            console.log(`  Upload Date: ${f.uploadDate}`);
            console.log('-----------------------------------');
        });
    }

    // 3. Check Unassociated Records (if any)
    // Records with no employeeId?
    const orphanRecords = await prisma.timeRecord.count({
        where: { employeeId: null }
    });
    console.log(`\n⚠️ Orphan Records (No Employee Link): ${orphanRecords}`);

}

main()
    .catch(e => {
        console.error('❌ DEBUG ERROR:', e);
    })
    .finally(async () => await prisma.$disconnect());
