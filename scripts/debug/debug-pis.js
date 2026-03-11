
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Active Employees PIS/CPF Debug ---');
    const employees = await prisma.employee.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, name: true, pis: true, cpf: true }
    });

    console.log(`Found ${employees.length} active employees.`);

    employees.forEach(emp => {
        const rawPis = emp.pis || '';
        const rawCpf = emp.cpf || '';
        const cleanPis = rawPis.replace(/\D/g, '');
        const cleanCpf = rawCpf.replace(/\D/g, '');

        console.log(`[${emp.name}]`);
        console.log(`  ID: ${emp.id}`);
        console.log(`  PIS (Raw): '${rawPis}' -> Clean: '${cleanPis}'`);
        console.log(`  CPF (Raw): '${rawCpf}' -> Clean: '${cleanCpf}'`);
        console.log('-----------------------------------');
    });

    console.log('--- Recent Time Files ---');
    const files = await prisma.timeClockFile.findMany({
        take: 5,
        orderBy: { uploadDate: 'desc' },
        include: { _count: { select: { records: true } } }
    });
    files.forEach(f => {
        console.log(`File: ${f.fileName} (${f.status}) - Records: ${f._count.records}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
