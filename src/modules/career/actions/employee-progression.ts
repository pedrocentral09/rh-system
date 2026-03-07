import { prisma } from '@/lib/prisma';
import { subMonths, differenceInMonths } from 'date-fns';

export async function getEmployeeProgression(employeeId: string, levelId: string) {
    try {
        const level = await prisma.careerLevel.findUnique({
            where: { id: levelId },
            include: { path: true, jobRole: true }
        });

        if (!level) return { success: false, error: 'Level not found' };

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { contract: true }
        });

        if (!employee) return { success: false, error: 'Employee not found' };

        // Configuration: Analyze last 6 months
        const now = new Date();
        const lookbackDate = subMonths(now, 6);

        // 1. DISCIPLINARY CHECK
        const warnings = await prisma.disciplinaryRecord.count({
            where: {
                employeeId,
                type: 'WARNING',
                date: { gte: lookbackDate }
            }
        });

        const absences = await prisma.disciplinaryRecord.count({
            where: {
                employeeId,
                type: 'SUSPENSION',
                date: { gte: lookbackDate }
            }
        });

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

        // 2. PERFORMANCE CHECK (Evaluation Scores)
        const completedReviews = await prisma.review.findMany({
            where: {
                evaluatedId: employeeId,
                status: 'COMPLETED',
                submittedAt: { gte: lookbackDate }
            },
            select: { totalScore: true }
        });

        const avgScore = completedReviews.length > 0
            ? completedReviews.reduce((acc, curr) => acc + (curr.totalScore || 0), 0) / completedReviews.length
            : 0;

        // 3. TENURE CHECK
        const hireDate = employee.hireDate || employee.contract?.admissionDate;
        const monthsInCompany = hireDate ? differenceInMonths(now, new Date(hireDate)) : 0;

        // 4. PROGRESS CALCULATION (%)
        // Dynamic Weights based on what's defined
        let totalWeights = 0;
        let weightedProgress = 0;

        // Tenure (Max 40% of total potential)
        if (level.minMonths && level.minMonths > 0) {
            totalWeights += 0.4;
            weightedProgress += (Math.min(1, monthsInCompany / level.minMonths)) * 0.4;
        }

        // Score (Max 40% of total potential)
        if (level.minScore && Number(level.minScore) > 0) {
            totalWeights += 0.4;
            const scoreVal = completedReviews.length > 0 ? (Math.min(1, avgScore / Number(level.minScore))) : 0;
            weightedProgress += scoreVal * 0.4;
        }

        // Disciplinary (Solid 20% of total potential)
        totalWeights += 0.2;
        const discWarningsPassed = level.maxWarnings === null || warnings <= level.maxWarnings;
        const discAbsencesPassed = level.maxAbsences === null || absences <= level.maxAbsences;
        const discDelaysPassed = level.maxDelays === null || delays <= level.maxDelays;
        const disciplinaryScoreValue = (discWarningsPassed && discAbsencesPassed && discDelaysPassed) ? 1 : 0.5;
        weightedProgress += disciplinaryScoreValue * 0.2;

        // Final Percentage (Normalized to 100)
        const totalProgress = totalWeights > 0
            ? Math.round((weightedProgress / totalWeights) * 100)
            : 0;

        const report = {
            warnings: {
                current: warnings,
                limit: level.maxWarnings ?? 5,
                passed: discWarningsPassed
            },
            absences: {
                current: absences,
                limit: level.maxAbsences ?? 3,
                passed: discAbsencesPassed
            },
            delays: {
                current: delays,
                limit: level.maxDelays ?? 5,
                passed: discDelaysPassed
            },
            score: {
                current: avgScore,
                limit: Number(level.minScore) || 0,
                passed: !level.minScore || avgScore >= Number(level.minScore)
            }
        };

        return {
            success: true,
            data: {
                report,
                totalProgress,
                monthsInCompany,
                allPassed: Object.values(report).every(r => r.passed),
                mission: level.mission,
                responsibilities: level.responsibilities,
                differential: level.differential,
                targetRole: level.jobRole.name
            }
        };

    } catch (error: any) {
        console.error('getEmployeeProgression error:', error);
        return { success: false, error: error.message };
    }
}
