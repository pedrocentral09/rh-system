const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_eval_cycles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            "startDate" TIMESTAMP NOT NULL,
            "endDate" TIMESTAMP NOT NULL,
            "isActive" BOOLEAN DEFAULT true,
            type TEXT DEFAULT '360',
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ perf_eval_cycles created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_reviews (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "cycleId" UUID NOT NULL REFERENCES perf_eval_cycles(id) ON DELETE CASCADE,
            "evaluatorId" TEXT NOT NULL REFERENCES personnel_employees(id),
            "evaluatedId" TEXT NOT NULL REFERENCES personnel_employees(id),
            status TEXT DEFAULT 'PENDING',
            notes TEXT,
            "totalScore" DOUBLE PRECISION,
            "submittedAt" TIMESTAMP,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ perf_reviews created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_review_questions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            category TEXT NOT NULL,
            text TEXT NOT NULL,
            weight DOUBLE PRECISION DEFAULT 1.0,
            "isActive" BOOLEAN DEFAULT true,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ perf_review_questions created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_review_answers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "reviewId" UUID NOT NULL REFERENCES perf_reviews(id) ON DELETE CASCADE,
            "questionId" UUID NOT NULL REFERENCES perf_review_questions(id) ON DELETE CASCADE,
            score INT NOT NULL,
            comment TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            UNIQUE("reviewId", "questionId")
        )
    `);
    console.log('✅ perf_review_answers created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_one_on_ones (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "managerId" TEXT NOT NULL REFERENCES personnel_employees(id),
            "employeeId" TEXT NOT NULL REFERENCES personnel_employees(id),
            date TIMESTAMP DEFAULT NOW(),
            content TEXT NOT NULL,
            "actionItems" TEXT,
            feeling TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW(),
            "updatedAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ perf_one_on_ones created');

    await p.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS perf_climate_surveys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            date TIMESTAMP DEFAULT NOW(),
            score INT NOT NULL,
            department TEXT,
            comment TEXT,
            "createdAt" TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log('✅ perf_climate_surveys created');

    await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
