const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS coins_reward_tasks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            "rewardAmount" INT NOT NULL,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ coins_reward_tasks created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS coins_task_completions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "employeeId" TEXT NOT NULL REFERENCES personnel_employees(id),
            "taskId" UUID NOT NULL REFERENCES coins_reward_tasks(id) ON DELETE CASCADE,
            "proofText" TEXT,
            status TEXT DEFAULT 'PENDING',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ coins_task_completions created');

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
