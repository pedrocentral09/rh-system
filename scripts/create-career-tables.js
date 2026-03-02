const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Create career_paths table
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS career_paths (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            description TEXT,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ career_paths created');

    // Create career_levels table
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS career_levels (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "careerPathId" UUID NOT NULL REFERENCES career_paths(id) ON DELETE CASCADE,
            "jobRoleId" UUID NOT NULL REFERENCES config_job_roles(id),
            "order" INT NOT NULL,
            "minMonths" INT DEFAULT 0,
            "minScore" DOUBLE PRECISION,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW(),
            UNIQUE("careerPathId", "order")
        )
    `);
    console.log('✅ career_levels created');

    // Create career_requirements table
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS career_requirements (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "careerLevelId" UUID NOT NULL REFERENCES career_levels(id) ON DELETE CASCADE,
            type TEXT NOT NULL,
            description TEXT NOT NULL,
            value TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ career_requirements created');

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
