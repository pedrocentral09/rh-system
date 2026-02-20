const { AFDSyncService } = require('../src/modules/core/services/AFDSyncService');
require('dotenv').config();

// Since it's a TS file, we might need ts-node or run it via a route.
// But wait, the system is running with Next.js.
// I can try to use 'tsx' to run the service.

async function main() {
    console.log('--- Iniciando Sincronização AFD via Firebase ---');
    const syncService = new AFDSyncService();

    try {
        const result = await syncService.sync();
        console.log('\n--- Resultado da Sincronização ---');
        console.log(JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('\n❌ Erro durante a sincronização:', error);
    }
}

main();
