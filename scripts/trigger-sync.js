const { AFDSyncService } = require('../src/modules/core/services/AFDSyncService');
require('dotenv').config();

// Since it's a TS file, we might need ts-node or run it via a route.
// But wait, the system is running with Next.js.
// I can try to use 'tsx' to run the service.

async function main() {
    const externalDbUrl = process.env.AFD_DATABASE_URL || process.env.RAILWAY_DB_URL;
    if (!externalDbUrl) {
        console.error('❌ AFD_DATABASE_URL or RAILWAY_DB_URL not found in environment');
        return;
    }

    console.log('--- Iniciando Sincronização AFD Manual ---');
    const syncService = new AFDSyncService(externalDbUrl);

    try {
        const result = await syncService.sync();
        console.log('\n--- Resultado da Sincronização ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n❌ Erro durante a sincronização:', error);
    }
}

main();
