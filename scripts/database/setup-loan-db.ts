
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

        // 1. Create payroll_loans table
        console.log('Creating table payroll_loans...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payroll_loans" (
                "id" TEXT NOT NULL,
                "employeeId" TEXT NOT NULL,
                "totalAmount" DECIMAL(65,30) NOT NULL,
                "installmentsCount" INTEGER NOT NULL,
                "reason" TEXT,
                "status" TEXT NOT NULL DEFAULT 'ACTIVE',
                "startDate" TIMESTAMP(3) NOT NULL,
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "payroll_loans_pkey" PRIMARY KEY ("id")
            );
        `);

        // 2. Create payroll_loan_installments table
        console.log('Creating table payroll_loan_installments...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS "payroll_loan_installments" (
                "id" TEXT NOT NULL,
                "loanId" TEXT NOT NULL,
                "periodId" TEXT NOT NULL,
                "installmentNumber" INTEGER NOT NULL,
                "amount" DECIMAL(65,30) NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP(3) NOT NULL,
                CONSTRAINT "payroll_loan_installments_pkey" PRIMARY KEY ("id")
            );
        `);

        // 3. Create unique index
        console.log('Creating unique index for installments...');
        await client.query(`
            CREATE UNIQUE INDEX IF NOT EXISTS "payroll_loan_installments_loanId_periodId_key" 
            ON "payroll_loan_installments"("loanId", "periodId");
        `);

        // 4. Create Rubric 5005
        console.log('Ensuring rubric 5005 exists...');
        await client.query(`
            INSERT INTO "payroll_events" ("id", "code", "name", "type", "description", "isSystem", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), '5005', 'Empréstimo Consignado', 'DEDUCTION', 'Desconto de parcela de empréstimo', true, now(), now())
            ON CONFLICT ("code") DO NOTHING;
        `);

        console.log('✅ Database setup for loans completed successfully!');
    } catch (err) {
        console.error('Error during loan database setup:', err);
    } finally {
        await client.end();
    }
}

main();
