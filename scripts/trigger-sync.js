
require('dotenv').config();
const { AFDSyncService } = require('../src/modules/core/services/AFDSyncService');
const { prisma } = require('../src/lib/prisma');

async function main() {
    console.log('--- ⚡️ STARTING AFD SYNC (PRODUCTION) ---');
    const externalDbUrl = process.env.RAILWAY_DB_URL || 'postgresql://postgres:glNJnFRkCSEXzRrahznMnSkRyDzuiNVG@shortline.proxy.rlwy.net:25803/railway';

    console.log(`📡 Connecting to Points DB: ${externalDbUrl.substring(0, 30)}...`);

    try {
        const syncService = new AFDSyncService(externalDbUrl);
        const result = await syncService.sync();

        console.log('\n✅ SYNC COMPLETED:');
        console.log(`- Files processed: ${result.filesProcessed}`);
        console.log(`- Punches imported: ${result.punchesImported}`);
        console.log(`- Punches skipped: ${result.punchesSkipped}`);
        console.log(`- Employees matched: ${result.employeesFound}`);

        if (result.employeesNotFound.length > 0) {
            console.log(`\n⚠️ Unmatched PIS/CPF (${result.employeesNotFound.length}):`);
            console.log(result.employeesNotFound.join(', '));
        }

        if (result.errors.length > 0) {
            console.log(`\n❌ Errors encountered (${result.errors.length}):`);
            result.errors.forEach(err => console.error(`  - ${err}`));
        }

    } catch (e) {
        console.error('❌ FATAL SYNC ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
