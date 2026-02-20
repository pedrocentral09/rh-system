
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
        console.log('🔄 [AUTO-SYNC] Triggering Collection and Sync...');
        const { exec } = require('child_process');

        // 1. Collect from physical clock (if configured)
        exec('node afd_collector.js', (cErr, cOut) => {
            if (cErr) {
                console.warn(`⚠️ [AUTO-SYNC] Collection Step: ${cErr.message}`);
            } else {
                console.log(`✅ [AUTO-SYNC] Collection Successful: ${cOut.slice(0, 200)}...`);
            }

            // 2. Sync collected files to main database
            exec('npx tsx scripts/trigger-sync.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ [AUTO-SYNC] Sync Step Error: ${error.message}`);
                    return;
                }
                console.log(`✅ [AUTO-SYNC] Sync Step Completed: ${stdout.slice(0, 500)}...`);
            });
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
    const { spawn } = require('child_process');

    // Use npm start (which runs "next start")
    // On Windows/Railway, we might need to handle shell: true or direct execution
    const child = spawn('npm', ['start'], {
        stdio: 'inherit',
        shell: true
    });

    child.on('error', (error) => {
        console.error('❌ [DEPLOY] App Start Failed to Spawn:', error.message);
        process.exit(1);
    });

    child.on('exit', (code) => {
        if (code !== 0) {
            console.error(`❌ [DEPLOY] App Server exited with code ${code}`);
            process.exit(code || 1);
        }
    });
}

// Main Execution
(async () => {
    await migrateDatabase();
    startAutoSync();
    startApp();
})();
