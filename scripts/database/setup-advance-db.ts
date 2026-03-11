
import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        // 1. Create table
        console.log('Creating table payroll_salary_advances...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payroll_salary_advances" (
                "id" TEXT NOT NULL,
                "employeeId" TEXT NOT NULL,
                "periodId" TEXT NOT NULL,
                "amount" DECIMAL(65,30) NOT NULL,
                "description" TEXT,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "paymentDate" TIMESTAMP(3),
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "payroll_salary_advances_pkey" PRIMARY KEY ("id")
            );
        `);

        // 2. Create index
        console.log('Creating unique index...');
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "payroll_salary_advances_employeeId_periodId_key" 
            ON "payroll_salary_advances"("employeeId", "periodId");
        `);

        // 3. Create Rubric
        console.log('Ensuring rubric 5004 exists...');
        await client.query(`
            INSERT INTO "payroll_events" ("id", "code", "name", "type", "description", "isSystem", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), '5004', 'Adiantamento de Salário', 'DEDUCTION', 'Desconto de adiantamento pago no período', true, now(), now())
            ON CONFLICT ("code") DO NOTHING;
        `);

        console.log('✅ Database setup completed successfully!');
    } catch (err) {
        console.error('Error during database setup:', err);
    } finally {
        await client.end();
    }
}

main();
