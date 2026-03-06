'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getEvaluationTemplates() {
    try {
        const templates = await prisma.evaluationTemplate.findMany({
            include: {
                _count: {
                    select: { questions: true, routines: true }
                },
                questions: {
                    select: { id: true, category: true, text: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: templates };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createEvaluationTemplate(data: {
    name: string;
    methodology: string;
    description?: string;
    questionIds: string[];
}) {
    try {
        const template = await prisma.evaluationTemplate.create({
            data: {
                name: data.name,
                methodology: data.methodology,
                description: data.description,
                questions: {
                    connect: data.questionIds.map(id => ({ id }))
                }
            }
        });
        revalidatePath('/dashboard/performance');
        return { success: true, data: template };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateEvaluationTemplate(id: string, data: {
    name?: string;
    methodology?: string;
    description?: string;
    questionIds?: string[];
}) {
    try {
        const updateData: any = {
            name: data.name,
            methodology: data.methodology,
            description: data.description,
        };

        if (data.questionIds) {
            updateData.questions = {
                set: data.questionIds.map(qid => ({ id: qid }))
            };
        }

        const template = await prisma.evaluationTemplate.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/dashboard/performance');
        return { success: true, data: template };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteEvaluationTemplate(id: string) {
    try {
        await prisma.evaluationTemplate.delete({ where: { id } });
        revalidatePath('/dashboard/performance');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
