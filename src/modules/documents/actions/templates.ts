'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/modules/core/actions/auth';

export async function getTemplatesAction() {
    try {
        const templates = await (prisma as any).documentTemplate.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: templates };
    } catch (error) {
        console.error('Error fetching templates:', error);
        return { success: false, error: 'Falha ao carregar matrizes.' };
    }
}

export async function createTemplateAction(formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
            return { success: false, error: 'Não autorizado.' };
        }

        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const content = formData.get('content') as string;
        const description = formData.get('description') as string;

        // Extract variables from content
        const variableRegex = /{{(.*?)}}/g;
        const variables: string[] = [];
        let match;
        while ((match = variableRegex.exec(content)) !== null) {
            if (!variables.includes(match[1].trim())) {
                variables.push(match[1].trim());
            }
        }

        const template = await (prisma as any).documentTemplate.create({
            data: {
                title,
                category,
                content,
                description,
                variables
            }
        });

        revalidatePath('/dashboard/documents');
        return { success: true, data: template };
    } catch (error) {
        console.error('Error creating template:', error);
        return { success: false, error: 'Erro ao criar matriz.' };
    }
}

export async function updateTemplateAction(id: string, formData: FormData) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
            return { success: false, error: 'Não autorizado.' };
        }

        const title = formData.get('title') as string;
        const category = formData.get('category') as string;
        const content = formData.get('content') as string;
        const description = formData.get('description') as string;

        // Extract variables
        const variableRegex = /{{(.*?)}}/g;
        const variables: string[] = [];
        let match;
        while ((match = variableRegex.exec(content)) !== null) {
            if (!variables.includes(match[1].trim())) {
                variables.push(match[1].trim());
            }
        }

        const template = await (prisma as any).documentTemplate.update({
            where: { id },
            data: {
                title,
                category,
                content,
                description,
                variables
            }
        });

        revalidatePath('/dashboard/documents');
        return { success: true, data: template };
    } catch (error) {
        console.error('Error updating template:', error);
        return { success: false, error: 'Erro ao atualizar matriz.' };
    }
}

export async function deleteTemplateAction(id: string) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
            return { success: false, error: 'Não autorizado.' };
        }

        await (prisma as any).documentTemplate.delete({
            where: { id }
        });

        revalidatePath('/dashboard/documents');
        return { success: true };
    } catch (error) {
        console.error('Error deleting template:', error);
        return { success: false, error: 'Erro ao excluir matriz.' };
    }
}
