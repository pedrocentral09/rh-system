
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/modules/core/actions/auth';
import { logAction } from '@/modules/core/actions/audit';

const DEFAULT_TASKS = [
    { title: 'Criar conta de E-mail', assignedTo: 'IT' },
    { title: 'Configurar Notebook', assignedTo: 'IT' },
    { title: 'Enviar Kit de Boas-vindas', assignedTo: 'HR' },
    { title: 'Cadastrar na Folha de Pagamento', assignedTo: 'HR' },
    { title: 'Apresentação da Equipe', assignedTo: 'MANAGER' }
];

export async function createOnboardingProcess(candidateId: string) {
    const user = await requireAuth(['ADMIN', 'HR']);

    try {
        const process = await prisma.onboardingProcess.create({
            data: {
                candidateId: candidateId,
                status: 'IN_PROGRESS',
                tasks: {
                    create: DEFAULT_TASKS.map(task => ({
                        title: task.title,
                        assignedTo: task.assignedTo,
                        status: 'PENDING'
                    }))
                }
            }
        });

        await logAction('CREATE', 'OnboardingProcess', { id: process.id, candidateId }, user.id);
        revalidatePath('/dashboard/onboarding');
        return { success: true, data: process };
    } catch (error) {
        console.error('Error creating onboarding:', error);
        return { success: false, error: 'Failed to create onboarding process' };
    }
}

export async function getOnboardingProcesses() {
    await requireAuth();

    const processes = await prisma.onboardingProcess.findMany({
        include: {
            candidate: true,
            employee: true, // In case we link it later
            tasks: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: processes };
}

export async function toggleTaskStatus(taskId: string, currentStatus: string) {
    await requireAuth();

    const newStatus = currentStatus === 'DONE' ? 'PENDING' : 'DONE';

    try {
        await prisma.onboardingTask.update({
            where: { id: taskId },
            data: {
                status: newStatus,
                completedAt: newStatus === 'DONE' ? new Date() : null,
                // completedBy: user.id (If we tracked who clicked)
            }
        });

        revalidatePath('/dashboard/onboarding');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
