'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addMonths } from 'date-fns';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { generateReviewsForCycle } from './cycles';

export async function getEmployeeEvaluationRoutines() {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                department: true,
                evaluationInterval: true,
                nextEvaluationDate: true,
                jobRole: {
                    select: { name: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: employees };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEmployeeEvaluationRoutine(
    employeeId: string,
    data: { interval: number | null; nextDate?: Date | null }
) {
    try {
        const updateData: any = {
            evaluationInterval: data.interval,
        };

        if (data.nextDate !== undefined) {
            updateData.nextEvaluationDate = data.nextDate;
        } else if (data.interval) {
            // Auto calculate next date if not provided (defaulting to interval from now if empty)
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                select: { nextEvaluationDate: true }
            });

            if (!employee?.nextEvaluationDate) {
                updateData.nextEvaluationDate = addMonths(new Date(), data.interval);
            }
        }

        const employee = await prisma.employee.update({
            where: { id: employeeId },
            data: updateData
        });

        revalidatePath('/dashboard/performance');
        return { success: true, data: employee };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// AUTOMATED ROUTINES
// ==========================================

export async function getEvaluationRoutines() {
    try {
        const routines = await prisma.evaluationRoutine.findMany({
            include: {
                template: {
                    include: {
                        _count: { select: { questions: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: routines };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createEvaluationRoutine(data: {
    templateId: string;
    name: string;
    frequencyMonths: number;
    targetDepartments: string[];
}) {
    try {
        // Calculate initial nextRun (today + frequency)
        const nextRun = addMonths(new Date(), data.frequencyMonths);

        const routine = await prisma.evaluationRoutine.create({
            data: {
                templateId: data.templateId,
                name: data.name,
                frequencyMonths: data.frequencyMonths,
                targetDepartments: data.targetDepartments,
                nextRun,
                isActive: true
            }
        });
        revalidatePath('/dashboard/performance');
        return { success: true, data: routine };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleRoutineStatus(id: string, isActive: boolean) {
    try {
        await prisma.evaluationRoutine.update({
            where: { id },
            data: { isActive }
        });
        revalidatePath('/dashboard/performance');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEvaluationRoutine(id: string) {
    try {
        await prisma.evaluationRoutine.delete({ where: { id } });
        revalidatePath('/dashboard/performance');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

/**
 * Core Automation Logic: Processes all active routines and creates cycles if due.
 */
export async function processAutomatedRoutines() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        // Find Admin/System Employee profile for evaluation assignment
        const adminEmployee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        const now = new Date();
        const activeRoutines = await prisma.evaluationRoutine.findMany({
            where: {
                isActive: true,
                nextRun: { lte: now }
            },
            include: {
                template: {
                    include: { questions: true }
                }
            }
        });

        if (activeRoutines.length === 0) {
            return { success: true, count: 0, message: 'Nenhuma rotina pendente para execução.' };
        }

        let totalCyclesCreated = 0;

        for (const routine of activeRoutines) {
            // 1. Create Cycle Linked to Template
            const cycle = await prisma.evaluationCycle.create({
                data: {
                    name: `${routine.name} - ${now.toLocaleDateString('pt-BR')}`,
                    startDate: now,
                    endDate: addMonths(now, 1), // Default 1 month to complete
                    type: routine.template.methodology,
                    isActive: true,
                    templateId: routine.template.id
                }
            });

            // 2. Find eligible employees based on departments
            const employees = await prisma.employee.findMany({
                where: {
                    status: 'ACTIVE',
                    ...(routine.targetDepartments.length > 0 ? {
                        department: { in: routine.targetDepartments }
                    } : {})
                }
            });

            // 3. Generate Reviews
            // Fallback evaluator: current user's employee profile if no direct manager logic
            const evaluatorId = adminEmployee?.id || '';

            if (evaluatorId && employees.length > 0) {
                const participants = employees
                    .filter(emp => emp.id !== evaluatorId) // Avoid self
                    .map(emp => ({
                        evaluatedId: emp.id,
                        evaluatorId: evaluatorId
                    }));

                // Import dynamically or ensure it's in scope to create many-to-many or individual reviews
                // Using the local generateReviewsForCycle helper
                await generateReviewsForCycle(cycle.id, participants);
            }

            // 4. Update Routine Run Info
            const nextRun = addMonths(now, routine.frequencyMonths);
            await prisma.evaluationRoutine.update({
                where: { id: routine.id },
                data: {
                    lastRun: now,
                    nextRun: nextRun
                }
            });

            totalCyclesCreated++;
        }

        revalidatePath('/dashboard/performance');
        return { success: true, count: totalCyclesCreated };
    } catch (error: any) {
        console.error('Routine Processor Error:', error);
        return { success: false, error: error.message };
    }
}
