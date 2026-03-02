const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS coins_transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "employeeId" TEXT NOT NULL REFERENCES personnel_employees(id),
            amount INT NOT NULL,
            type TEXT NOT NULL,
            source TEXT,
            description TEXT NOT NULL,
            "createdAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ coins_transactions created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS coins_reward_catalog (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            title TEXT NOT NULL,
            description TEXT,
            cost INT NOT NULL,
            stock INT,
            "isActive" BOOLEAN DEFAULT true,
            "imageUrl" TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ coins_reward_catalog created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS coins_redemption_requests (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "employeeId" TEXT NOT NULL REFERENCES personnel_employees(id),
            "rewardId" UUID NOT NULL REFERENCES coins_reward_catalog(id) ON DELETE CASCADE,
            "costAtTime" INT NOT NULL,
            status TEXT DEFAULT 'PENDING',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ coins_redemption_requests created');

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
