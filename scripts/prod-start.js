
const { execSync } = require('child_process');

// Migration Function
async function migrateDatabase() {
    console.log('🚀 [DEPLOY] Starting Database Migration...');
    try {
        // Attempt schema sync with data loss acceptance (for column deletion/addition)
        // Use local binary directly to avoid npx path issues
        const prismaPath = './node_modules/.bin/prisma';
        try {
            console.log(`Trying migration with: ${prismaPath} db push`);
            execSync(`${prismaPath} db push --accept-data-loss`, { stdio: 'inherit' });
        } catch (localError) {
            console.warn('⚠️ [DEPLOY] Local binary failed, trying npx fallback...');
            execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
        }
        console.log('✅ [DEPLOY] Migration Successful!');
    } catch (error) {
        console.error('❌ [DEPLOY] Migration Failed:', error.message);
        console.log('⚠️ [DEPLOY] Proceeding with App Start despite migration failure...');
        // We do NOT exit here, so the app can start and we can debug via logs/dashboard
    }
}

// Auto-Sync Function (Background)
function startAutoSync() {
    console.log('🔄 [DEPLOY] Starting Background Auto-Sync...');

    const runSync = () => {
        console.log('🔄 [AUTO-SYNC] Triggering AFDSyncService...');
        const { exec } = require('child_process');
        // Use tsx to run the sync script
        exec('npx tsx scripts/trigger-sync.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ [AUTO-SYNC] Error: ${error.message}`);
                return;
            }
            console.log(`✅ [AUTO-SYNC] Completed: ${stdout.slice(0, 500)}...`);
        });
    };

    // Run 1 minute after start
    setTimeout(runSync, 60 * 1000);
    // Every 5 minutes
    setInterval(runSync, 5 * 60 * 1000);
}

// Start Function
function startApp() {
    console.log('🚀 [DEPLOY] Starting Next.js Server...');
    try {
        // Use npm start (which runs "next start")
        execSync('npm start', { stdio: 'inherit' });
    } catch (error) {
        console.error('❌ [DEPLOY] App Start Failed:', error.message);
        process.exit(1); // Critical failure if app won't start
    }
}

// Main Execution
(async () => {
    await migrateDatabase();
    startAutoSync();
    startApp();
})();
