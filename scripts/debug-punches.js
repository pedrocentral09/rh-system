const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const clean = (id) => id ? String(id).replace(/\D/g, '').replace(/^0+/, '') : '';

    // Get Maria Carolina's CPF cleaned
    const maria = await p.employee.findFirst({
        where: { name: { contains: 'MARIA CAROLINA', mode: 'insensitive' } },
        select: { name: true, cpf: true, pis: true, id: true }
    });
    console.log('Maria Carolina:', maria?.name);
    console.log('CPF:', maria?.cpf, '-> cleaned:', clean(maria?.cpf));

    // Check ALL punch PIS values to see if any contains her CPF digits
    const allPunches = await p.timeRecord.findMany({ select: { pis: true } });
    const uniquePis = [...new Set(allPunches.map(p => p.pis))];

    const mariaCpfClean = clean(maria?.cpf);
    console.log(`\nLooking for "${mariaCpfClean}" in ${uniquePis.length} unique punch IDs...`);

    uniquePis.forEach(pis => {
        const cleanedPis = clean(pis);
        if (cleanedPis.includes(mariaCpfClean) || mariaCpfClean.includes(cleanedPis)) {
            console.log(`  MATCH FOUND! Punch PIS: ${pis} (cleaned: ${cleanedPis})`);
        }
    });

    // Show all unique PIS values from punches
    console.log('\nAll unique IDs from punches:');
    uniquePis.sort().forEach(pis => {
        const cleaned = clean(pis);
        console.log(`  ${pis} -> ${cleaned} (${cleaned.length} digits)`);
    });

    // Check what the clock is actually sending - is it CPF or PIS?
    // CPF = 11 digits, PIS = 11-12 digits
    console.log('\nDigit length distribution:');
    const lengths = {};
    uniquePis.forEach(pis => {
        const len = clean(pis).length;
        lengths[len] = (lengths[len] || 0) + 1;
    });
    console.log(lengths);

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
