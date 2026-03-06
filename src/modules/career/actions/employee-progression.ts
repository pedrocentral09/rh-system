import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

export async function getEmployeeProgression(employeeId: string, levelId: string) {
    try {
        const level = await prisma.careerLevel.findUnique({
            where: { id: levelId },
            include: { path: true }
        });

        if (!level) return { success: false, error: 'Level not found' };

        // Configuration: Analyze last 6 months (standard evaluation period)
        const now = new Date();
        const lookbackDate = subMonths(now, 6);

        // 1. DISCIPLINARY CHECK (Warnings)
        const warnings = await prisma.disciplinaryRecord.count({
            where: {
                employeeId,
                type: 'WARNING',
                date: { gte: lookbackDate }
            }
        });

        // 2. TIME TRACKING CHECK (Absences & Delays)
        // We'll use a simplified check based on time records or a pre-calculated summary if available.
        // For now, let's assume we query disciplinary records for suspension (often used for severe absences)
        // OR we'd need to run the calculation logic for the last 6 months.

        // Let's assume we have a way to count absences. If not, we count SUSPENSIONS as a proxy for now 
        // or planned integration with getTimeSheet.
        const absences = await prisma.disciplinaryRecord.count({
            where: {
                employeeId,
                type: 'SUSPENSION', // Often triggered by absences
                date: { gte: lookbackDate }
            }
        });

        // 3. TIME TRACKING CHECK (Delays)
        // Simplified: Search for disciplinary records of type 'OTHER' containing 'atraso' in description
        // or a dedicated 'DELAY' type if available.
        const delays = await prisma.disciplinaryRecord.count({
            where: {
                employeeId,
                OR: [
                    { type: 'WARNING', description: { contains: 'atraso', mode: 'insensitive' } },
                    { description: { contains: 'atraso', mode: 'insensitive' } }
                ],
                date: { gte: lookbackDate }
            }
        });

        // 4. COMPARISON
        const report = {
            warnings: {
                current: warnings,
                limit: level.maxWarnings ?? Infinity,
                passed: level.maxWarnings === null || warnings <= level.maxWarnings
            },
            absences: {
                current: absences,
                limit: level.maxAbsences ?? Infinity,
                passed: level.maxAbsences === null || absences <= level.maxAbsences
            },
            delays: {
                current: delays,
                limit: level.maxDelays ?? Infinity,
                passed: level.maxDelays === null || delays <= level.maxDelays
            }
        };

        const allPassed = Object.values(report).every(r => r.passed);

        return {
            success: true,
            data: {
                report,
                allPassed,
                mission: level.mission,
                responsibilities: level.responsibilities,
                differential: level.differential
            }
        };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
