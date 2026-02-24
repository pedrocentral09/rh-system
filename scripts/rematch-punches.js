const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const clean = (id) => id ? String(id).replace(/\D/g, '').replace(/^0+/, '') : '';

    // Load all employees with CPF or PIS
    const employees = await p.employee.findMany({
        where: { status: { in: ['ACTIVE', 'TERMINATED'] } },
        select: { id: true, name: true, pis: true, cpf: true }
    });

    // Build lookup maps
    const pisMap = new Map();
    const cpfMap = new Map();

    employees.forEach(emp => {
        const cleanPis = clean(emp.pis);
        if (cleanPis) pisMap.set(cleanPis, emp.id);

        const cleanCpf = clean(emp.cpf);
        if (cleanCpf) cpfMap.set(cleanCpf, emp.id);
    });

    console.log(`Loaded ${employees.length} employees`);
    console.log(`PIS map entries: ${pisMap.size}`);
    console.log(`CPF map entries: ${cpfMap.size}`);

    // Get all unmatched punches
    const unmatched = await p.timeRecord.findMany({
        where: { employeeId: null },
        select: { id: true, pis: true }
    });

    console.log(`\nUnmatched punches to re-process: ${unmatched.length}`);

    let matched = 0;
    let stillUnmatched = 0;

    for (const punch of unmatched) {
        const rawId = clean(punch.pis);
        let empId = pisMap.get(rawId) || cpfMap.get(rawId);

        // Fallback: last 10 digits
        if (!empId && rawId.length >= 10) {
            const shortId = rawId.slice(-10);
            empId = pisMap.get(shortId) || cpfMap.get(shortId);
        }

        if (empId) {
            await p.timeRecord.update({
                where: { id: punch.id },
                data: { employeeId: empId }
            });
            matched++;
        } else {
            stillUnmatched++;
        }
    }

    console.log(`\n===== RESULTADO =====`);
    console.log(`Re-matched: ${matched}`);
    console.log(`Still unmatched: ${stillUnmatched}`);

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
