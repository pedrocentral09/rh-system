'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/modules/core/actions/auth';

// ==========================================
// CYCLES
// ==========================================

export async function getEvaluationCycles() {
    try {
        const cycles = await prisma.evaluationCycle.findMany({
            orderBy: { startDate: 'desc' },
            include: {
                _count: {
                    select: { reviews: true },
                },
            },
        });
        return { success: true, data: cycles };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getCycleWithDetails(id: string) {
    try {
        const cycle = await prisma.evaluationCycle.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        evaluator: { select: { id: true, name: true } },
                        evaluated: { select: { id: true, name: true } },
                    },
                    orderBy: { evaluated: { name: 'asc' } }
                }
            }
        });
        return { success: true, data: cycle };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getEligibleParticipants() {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                department: true,
                nextEvaluationDate: true,
                evaluationInterval: true,
                jobRole: { select: { name: true } },
                contract: {
                    select: {
                        store: { select: { name: true } },
                        sectorDef: { select: { name: true } }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Grouping logic for the UI
        const now = new Date();
        const response = employees.map(emp => {
            const isDue = emp.nextEvaluationDate ? new Date(emp.nextEvaluationDate) <= now : false;
            return {
                ...emp,
                status: isDue ? 'DUE' : emp.evaluationInterval ? 'SCHEDULED' : 'PENDING'
            };
        });

        return { success: true, data: response };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getActiveEvaluationCycle() {
    try {
        const cycle = await prisma.evaluationCycle.findFirst({
            where: { isActive: true },
            orderBy: { startDate: 'desc' },
        });
        return { success: true, data: cycle };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createEvaluationCycle(data: { name: string; startDate: Date; endDate: Date; type: string }) {
    try {
        const cycle = await prisma.evaluationCycle.create({
            data: {
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                type: data.type,
            },
        });
        revalidatePath('/dashboard/performance/cycles');
        return { success: true, data: cycle };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleCycleStatus(id: string, isActive: boolean) {
    try {
        const cycle = await prisma.evaluationCycle.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/dashboard/performance/cycles');
        return { success: true, data: cycle };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEvaluationCycle(id: string) {
    try {
        await prisma.evaluationCycle.delete({ where: { id } });
        revalidatePath('/dashboard/performance/cycles');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// QUESTIONS
// ==========================================

export async function getReviewQuestions() {
    try {
        const questions = await prisma.reviewQuestion.findMany({
            where: { isActive: true },
            orderBy: { category: 'asc' },
        });
        return { success: true, data: questions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createReviewQuestion(data: { category: string; text: string; weight?: number }) {
    try {
        const question = await prisma.reviewQuestion.create({
            data: {
                category: data.category,
                text: data.text,
                weight: data.weight || 1.0,
            },
        });
        revalidatePath('/dashboard/performance/questions');
        return { success: true, data: question };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleQuestionStatus(id: string, isActive: boolean) {
    try {
        await prisma.reviewQuestion.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/dashboard/performance/questions');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// CYCLE DISPATCH (Create Reviews)
// ==========================================

export async function generateReviewsForCycle(cycleId: string, participants: { evaluatorId: string; evaluatedId: string }[]) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        // Fetch the cycle to see if it has an attached template
        const cycle = await prisma.evaluationCycle.findUnique({
            where: { id: cycleId },
            include: {
                template: {
                    include: { questions: true }
                }
            }
        });

        // 1. Bulk insert reviews
        const data = participants.map(p => ({
            cycleId,
            evaluatorId: p.evaluatorId,
            evaluatedId: p.evaluatedId,
            status: 'PENDING',
        }));

        const result = await prisma.review.createManyAndReturn({
            data,
            skipDuplicates: true, // Prevents creating same review pair twice in a cycle
        });

        // 2. Pre-populate questions if a template exists
        if (cycle?.template?.questions.length && result.length > 0) {
            const answersToCreate = [];
            for (const review of result) {
                for (const question of cycle.template.questions) {
                    answersToCreate.push({
                        reviewId: review.id,
                        questionId: question.id,
                        score: 0, // Default un-answered score
                        comment: ''
                    });
                }
            }

            if (answersToCreate.length > 0) {
                await prisma.reviewAnswer.createMany({
                    data: answersToCreate,
                    skipDuplicates: true
                });
            }
        }

        revalidatePath(`/dashboard/performance/cycles/${cycleId}`);
        return { success: true, count: result.length };
    } catch (error: any) {
        console.error('Error generating reviews:', error);
        return { success: false, error: error.message };
    }
}
