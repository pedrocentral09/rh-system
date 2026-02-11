
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const logs: string[] = [];
        logs.push('🚀 Starting DB Repair...');

        // 1. Create JobRole table if not exists (config_job_roles)
        logs.push('🔧 Checking config_job_roles table...');
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "config_job_roles" (
                    "id" TEXT NOT NULL,
                    "name" TEXT NOT NULL,
                    "cbo" TEXT,
                    "description" TEXT,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL,

                    CONSTRAINT "config_job_roles_pkey" PRIMARY KEY ("id")
                );
            `);
            await prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "config_job_roles_name_key" ON "config_job_roles"("name");
            `);
            logs.push('✅ config_job_roles table checked/created.');
        } catch (e: any) {
            logs.push(`❌ Failed to create config_job_roles: ${e.message}`);
        }

        // 2. Add jobRoleId column to personnel_employees
        logs.push('🔧 Checking personnel_employees.jobRoleId column...');
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "personnel_employees" ADD COLUMN IF NOT EXISTS "jobRoleId" TEXT;
            `);
            logs.push('✅ personnel_employees.jobRoleId column added (if missing).');
        } catch (e: any) {
            logs.push(`❌ Failed to add jobRoleId column: ${e.message}`);
        }

        // 3. Add Foreign Key Constraint (optional but good)
        logs.push('🔗 Adding Foreign Key constraint...');
        try {
            // Check if constraint exists first? Hard in raw SQL reliably cross-db.
            // Just try strict constraint. If fails (already exists), ignore.
            await prisma.$executeRawUnsafe(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personnel_employees_jobRoleId_fkey') THEN
                        ALTER TABLE "personnel_employees"
                        ADD CONSTRAINT "personnel_employees_jobRoleId_fkey"
                        FOREIGN KEY ("jobRoleId")
                        REFERENCES "config_job_roles"("id")
                        ON DELETE SET NULL ON UPDATE CASCADE;
                    END IF;
                END $$;
             `);
            logs.push('✅ Foreign Key constraint checked/added.');
        } catch (e: any) {
            logs.push(`⚠️ FK constraint warning (might be ok): ${e.message}`);
        }

        // 4. Create Sector table (config_sectors)
        logs.push('🔧 Checking config_sectors table...');
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "config_sectors" (
                    "id" TEXT NOT NULL,
                    "name" TEXT NOT NULL,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL,
                    CONSTRAINT "config_sectors_pkey" PRIMARY KEY ("id")
                );
            `);
            await prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "config_sectors_name_key" ON "config_sectors"("name");
            `);
            logs.push('✅ config_sectors table checked/created.');
        } catch (e: any) {
            logs.push(`❌ Failed to create config_sectors: ${e.message}`);
        }

        // 5. Add sectorId to personnel_contracts
        logs.push('🔧 Checking personnel_contracts.sectorId column...');
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "personnel_contracts" ADD COLUMN IF NOT EXISTS "sectorId" TEXT;
            `);
            // Add FK if possible
            await prisma.$executeRawUnsafe(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personnel_contracts_sectorId_fkey') THEN
                        ALTER TABLE "personnel_contracts"
                        ADD CONSTRAINT "personnel_contracts_sectorId_fkey"
                        FOREIGN KEY ("sectorId")
                        REFERENCES "config_sectors"("id")
                        ON DELETE SET NULL ON UPDATE CASCADE;
                    END IF;
                END $$;
             `);
            logs.push('✅ personnel_contracts.sectorId column checked/added.');
        } catch (e: any) {
            logs.push(`❌ Failed to add sectorId column: ${e.message}`);
        }

        // 6. Add workShiftId to personnel_contracts (just in case)
        logs.push('🔧 Checking personnel_contracts.workShiftId column...');
        try {
            await prisma.$executeRawUnsafe(`
                ALTER TABLE "personnel_contracts" ADD COLUMN IF NOT EXISTS "workShiftId" TEXT;
            `);
            await prisma.$executeRawUnsafe(`
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'personnel_contracts_workShiftId_fkey') THEN
                         -- Only adding if table time_shift_types exists, to be safe
                         IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename  = 'time_shift_types') THEN
                            ALTER TABLE "personnel_contracts"
                            ADD CONSTRAINT "personnel_contracts_workShiftId_fkey"
                            FOREIGN KEY ("workShiftId")
                            REFERENCES "time_shift_types"("id")
                            ON DELETE SET NULL ON UPDATE CASCADE;
                         END IF;
                    END IF;
                END $$;
             `);
            logs.push('✅ personnel_contracts.workShiftId column checked/added.');
        } catch (e: any) {
            logs.push(`❌ Failed to add workShiftId: ${e.message}`);
        }

        // 7. Create Shift Type table (time_shift_types)
        logs.push('🔧 Checking time_shift_types table...');
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "time_shift_types" (
                    "id" TEXT NOT NULL,
                    "name" TEXT NOT NULL,
                    "startTime" TEXT NOT NULL,
                    "endTime" TEXT NOT NULL,
                    "breakDuration" INTEGER NOT NULL DEFAULT 60,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL,
                    CONSTRAINT "time_shift_types_pkey" PRIMARY KEY ("id")
                );
            `);
            logs.push('✅ time_shift_types table checked/created.');
        } catch (e: any) {
            logs.push(`❌ Failed to create time_shift_types: ${e.message}`);
        }

        // 8. Create Termination Reason table (config_termination_reasons)
        logs.push('🔧 Checking config_termination_reasons table...');
        try {
            await prisma.$executeRawUnsafe(`
                CREATE TABLE IF NOT EXISTS "config_termination_reasons" (
                    "id" TEXT NOT NULL,
                    "name" TEXT NOT NULL,
                    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updatedAt" TIMESTAMP(3) NOT NULL,
                    CONSTRAINT "config_termination_reasons_pkey" PRIMARY KEY ("id")
                );
            `);
            await prisma.$executeRawUnsafe(`
                CREATE UNIQUE INDEX IF NOT EXISTS "config_termination_reasons_name_key" ON "config_termination_reasons"("name");
            `);
            logs.push('✅ config_termination_reasons table checked/created.');
        } catch (e: any) {
            logs.push(`❌ Failed to create config_termination_reasons: ${e.message}`);
        }

        // 9. Update Companies Table (core_companies)
        logs.push('🔧 Updating core_companies columns...');
        try {
            const columns = ['complement', 'email', 'municipalRegistration', 'phone', 'responsible', 'stateRegistration', 'tradingName'];
            for (const col of columns) {
                await prisma.$executeRawUnsafe(`ALTER TABLE "core_companies" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
            }
            logs.push('✅ core_companies columns checked/added.');
        } catch (e: any) {
            logs.push(`❌ Failed to update core_companies: ${e.message}`);
        }

        // 10. Update Stores Table (core_stores)
        logs.push('🔧 Updating core_stores columns...');
        try {
            const columns = ['cnpj', 'complement', 'email', 'municipalRegistration', 'phone', 'responsible', 'stateRegistration', 'tradingName'];
            for (const col of columns) {
                await prisma.$executeRawUnsafe(`ALTER TABLE "core_stores" ADD COLUMN IF NOT EXISTS "${col}" TEXT;`);
            }
            logs.push('✅ core_stores columns checked/added.');
        } catch (e: any) {
            logs.push(`❌ Failed to update core_stores: ${e.message}`);
        }

        return NextResponse.json({
            status: 'completed',
            logs
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
