
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function setup() {
    try {
        console.log('Connected to database.');

        // 1. Create External Import Table
        console.log('Creating table payroll_external_imports...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "payroll_external_imports" (
                "id" TEXT PRIMARY KEY,
                "employeeId" TEXT NOT NULL,
                "periodId" TEXT NOT NULL,
                "itemCode" TEXT NOT NULL,
                "label" TEXT NOT NULL,
                "amount" DECIMAL(10,2) NOT NULL,
                "sourceStore" TEXT,
                "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "payroll_external_imports_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "personnel_employees" ("id") ON DELETE CASCADE,
                CONSTRAINT "payroll_external_imports_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "payroll_periods" ("id") ON DELETE CASCADE
            );
        `);

        // Add column if table already existed without it
        try {
            await prisma.$executeRawUnsafe(`ALTER TABLE "payroll_external_imports" ADD COLUMN IF NOT EXISTS "sourceStore" TEXT;`);
        } catch (e) {
            console.log('Column sourceStore might already exist.');
        }


        // 2. Create Unique Index
        console.log('Creating unique index...');
        await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "payroll_external_imports_employee_period_item_key";`);
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "payroll_external_imports_idx_new" 
            ON "payroll_external_imports" ("employeeId", "periodId", "itemCode", "sourceStore");
        `);


        // 3. Ensure Rubrics exist
        console.log('Ensuring rubrics 5006 and 5007 exist...');
        const rubrics = [
            { code: '5006', name: 'Convênio ERP', type: 'DEDUCTION' },
            { code: '5007', name: 'Quebra de Caixa (Desconto)', type: 'DEDUCTION' }
        ];

        for (const r of rubrics) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO "payroll_events" ("id", "code", "name", "type", "isSystem", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, true, now())
                ON CONFLICT ("code") DO UPDATE SET "name" = $2, "type" = $3;
            `, r.code, r.name, r.type);
        }

        console.log('✅ Database setup for ERP Imports completed successfully!');
    } catch (error) {
        console.error('❌ Error setting up database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

setup();
