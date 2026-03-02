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

        // Bulk insert reviews
        const data = participants.map(p => ({
            cycleId,
            evaluatorId: p.evaluatorId,
            evaluatedId: p.evaluatedId,
            status: 'PENDING',
        }));

        const result = await prisma.review.createMany({
            data,
            skipDuplicates: true, // Prevents creating same review pair twice in a cycle
        });

        revalidatePath(`/dashboard/performance/cycles/${cycleId}`);
        return { success: true, count: result.count };
    } catch (error: any) {
        console.error('Error generating reviews:', error);
        return { success: false, error: error.message };
    }
}
