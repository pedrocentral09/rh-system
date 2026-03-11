'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth, getCurrentUser } from '@/modules/core/actions/auth';
import { revalidatePath } from 'next/cache';
import { ComplianceService } from '../../reports/services/compliance.service';

export async function getMandatoryDocuments() {
    try {
        await requireAuth(['ADMIN']);
        const docs = await prisma.mandatoryDocument.findMany({
            include: { jobRole: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: docs as any };
    } catch (error) {
        return { success: false, error: 'Erro ao buscar documentos obrigatórios.' };
    }
}

export async function getMyComplianceStatus() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autenticado.' };

        const employee = await prisma.employee.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!employee) return { success: false, error: 'Usuário não vinculado a colaborador.' };

        return await ComplianceService.getEmployeeCompliance(employee.id);
    } catch (error) {
        return { success: false, error: 'Erro ao buscar conformidade pessoal.' };
    }
}

export async function createMandatoryDocument(data: { title: string, category: string, jobRoleId: string, description?: string }) {
    try {
        await requireAuth(['ADMIN']);
        const doc = await prisma.mandatoryDocument.create({
            data
        });
        revalidatePath('/dashboard/configuration');
        return { success: true, data: doc };
    } catch (error) {
        return { success: false, error: 'Erro ao criar documento obrigatório.' };
    }
}

export async function deleteMandatoryDocument(id: string) {
    try {
        await requireAuth(['ADMIN']);
        await prisma.mandatoryDocument.delete({
            where: { id }
        });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir documento.' };
    }
}

export async function getMandatoryDocumentsByRole(jobRoleId: string) {
    try {
        await requireAuth(['ADMIN']);
        const docs = await prisma.mandatoryDocument.findMany({
            where: { jobRoleId },
            orderBy: { title: 'asc' }
        });
        return { success: true, data: docs };
    } catch (error) {
        return { success: false, error: 'Erro ao buscar documentos por cargo.' };
    }
}

export async function checkAndNotifyCompliance() {
    try {
        await requireAuth(['ADMIN']);

        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                user: true,
                jobRole: { include: { mandatoryDocuments: true } },
                documents: { where: { status: 'SIGNED' } }
            }
        }) as any[];

        let count = 0;
        for (const emp of employees) {
            if (!emp.user) continue;

            const mandatory = emp.jobRole?.mandatoryDocuments || [];
            const signed = emp.documents || [];
            const signedTitles = new Set(signed.map((s: any) => s.type));
            const pending = mandatory.filter((m: any) => !signedTitles.has(m.title));

            if (pending.length > 0) {
                // Check if already notified recently (last 24h)
                const existing = await prisma.notification.findFirst({
                    where: {
                        userId: emp.user.id,
                        title: 'Pendência de Documentação',
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    }
                });

                if (!existing) {
                    await prisma.notification.create({
                        data: {
                            userId: emp.user.id,
                            title: 'Pendência de Documentação',
                            message: `Você possui ${pending.length} documentos obrigatórios pendentes de assinatura. Regularize sua situação no portal.`,
                            type: 'URGENT',
                            link: '/portal/documents'
                        }
                    });
                    count++;
                }
            }
        }

        return { success: true, message: `${count} notificações enviadas.` };
    } catch (error) {
        return { success: false, error: 'Erro ao processar notificações.' };
    }
}
