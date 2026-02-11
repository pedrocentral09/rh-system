
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
