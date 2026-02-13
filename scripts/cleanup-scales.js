const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Robust Cleanup of Duplicate Work Scales ---');

    // 1. Get all scales
    const allScales = await prisma.workScale.findMany();
    console.log(`Total records checked: ${allScales.length}`);

    // Track processed normalized keys: employeeId_YYYY-MM-DD
    const processed = new Map();
    const toDelete = [];
    const toUpdate = [];

    for (const scale of allScales) {
        // Normalize the date of the record we are looking at
        const normalizedDate = new Date(scale.date);
        normalizedDate.setHours(0, 0, 0, 0);
        const normalizedIso = normalizedDate.toISOString();
        const dateStr = normalizedIso.split('T')[0];
        const key = `${scale.employeeId}_${dateStr}`;

        if (processed.has(key)) {
            // We already processed a record for this employee/day!
            const existing = processed.get(key);
            console.log(`Duplicate found for ${key}. Existing ID: ${existing.id}, Current ID: ${scale.id}`);

            // Preference: if current has shiftTypeId and existing doesnt, keep current
            if (scale.shiftTypeId && !existing.shiftTypeId) {
                toDelete.push(existing.id);
                processed.set(key, scale);
                // Re-evaluate if current needs normalization (it will be checked below anyway)
            } else {
                toDelete.push(scale.id);
                continue; // Move to next scale
            }
        } else {
            processed.set(key, scale);
        }
    }

    // Now check if the "winners" need normalization
    for (const [key, scale] of processed.entries()) {
        const normalizedDate = new Date(scale.date);
        normalizedDate.setHours(0, 0, 0, 0);
        if (scale.date.toISOString() !== normalizedDate.toISOString()) {
            toUpdate.push({ id: scale.id, date: normalizedDate });
        }
    }

    console.log(`\nFinal tally:`);
    console.log(`- To Delete: ${toDelete.length}`);
    console.log(`- To Normalize: ${toUpdate.length}`);

    // Execution
    if (toDelete.length > 0) {
        console.log('Deleting records...');
        // Delete in chunks to avoid URL length issues or similar
        for (let i = 0; i < toDelete.length; i += 50) {
            const chunk = toDelete.slice(i, i + 50);
            await prisma.workScale.deleteMany({
                where: { id: { in: chunk } }
            });
        }
    }

    if (toUpdate.length > 0) {
        console.log('Normalizing remaining records...');
        for (const u of toUpdate) {
            await prisma.workScale.update({
                where: { id: u.id },
                data: { date: u.date }
            });
        }
    }

    console.log('\nCleanup completed successfully!');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
