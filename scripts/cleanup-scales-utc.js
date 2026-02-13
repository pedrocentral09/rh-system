const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- FINAL Robust Cleanup (UTC) of Duplicate Work Scales ---');

    // 1. Get all scales
    const allScales = await prisma.workScale.findMany();
    console.log(`Total records checked: ${allScales.length}`);

    // Track processed normalized keys: employeeId_YYYY-MM-DD
    const processed = new Map();
    const toDelete = [];
    const toUpdate = [];

    for (const scale of allScales) {
        // Normalize the date of the record we are looking at to UTC 00:00:00
        const dateObj = new Date(scale.date);
        const normalizedDate = new Date(Date.UTC(
            dateObj.getUTCFullYear(),
            dateObj.getUTCMonth(),
            dateObj.getUTCDate(),
            0, 0, 0, 0
        ));

        const normalizedIso = normalizedDate.toISOString();
        const dateStr = normalizedIso.split('T')[0];
        const key = `${scale.employeeId}_${dateStr}`;

        if (processed.has(key)) {
            const existing = processed.get(key);
            console.log(`Conflict for ${key}: existing ID ${existing.id}, current ID ${scale.id}`);

            // Keep the one with a shiftTypeId
            if (scale.shiftTypeId && !existing.shiftTypeId) {
                toDelete.push(existing.id);
                processed.set(key, scale);
            } else {
                toDelete.push(scale.id);
                continue;
            }
        } else {
            processed.set(key, scale);
        }
    }

    // Now check if winners need normalization (if they weren't already at UTC 00:00:00)
    for (const [key, scale] of processed.entries()) {
        const dateObj = new Date(scale.date);
        const normalizedIso = new Date(Date.UTC(
            dateObj.getUTCFullYear(),
            dateObj.getUTCMonth(),
            dateObj.getUTCDate(),
            0, 0, 0, 0
        )).toISOString();

        if (scale.date.toISOString() !== normalizedIso) {
            toUpdate.push({ id: scale.id, date: new Date(normalizedIso) });
        }
    }

    console.log(`\nResults:`);
    console.log(`- To Delete: ${toDelete.length}`);
    console.log(`- To Normalize: ${toUpdate.length}`);

    if (toDelete.length > 0) {
        console.log('Deleting duplicates...');
        for (let i = 0; i < toDelete.length; i += 50) {
            const chunk = toDelete.slice(i, i + 50);
            await prisma.workScale.deleteMany({ where: { id: { in: chunk } } });
        }
    }

    if (toUpdate.length > 0) {
        console.log('Normalizing remaining records to UTC 00:00:00...');
        for (const u of toUpdate) {
            try {
                await prisma.workScale.update({
                    where: { id: u.id },
                    data: { date: u.date }
                });
            } catch (err) {
                console.error(`Error normalizing ${u.id}:`, err.message);
                // If update fails because of unique constraint after delete, something is very wrong, 
                // but let's just log it.
            }
        }
    }

    console.log('\nCleanup FINISHED.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
