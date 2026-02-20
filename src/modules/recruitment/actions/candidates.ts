
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/modules/core/actions/auth';
import { logAction } from '@/modules/core/actions/audit';

/**
 * Internal candidate registration (used by HR/Admin in dashboard)
 * Requires authentication and allows setting all fields including source.
 */
export async function registerCandidateInternal(data: any) {
    const user = await requireAuth(['ADMIN', 'HR']);

    try {
        const candidate = await prisma.candidate.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                linkedin: data.linkedin,
                notes: data.notes,
                resumeUrl: data.resumeUrl,
                source: data.source,
            }
        });

        if (data.jobId) {
            await prisma.jobApplication.create({
                data: {
                    jobId: data.jobId,
                    candidateId: candidate.id,
                    status: 'NEW'
                }
            });
        }

        await logAction('CREATE', 'Candidate', { id: candidate.id, name: candidate.name }, user.id);
        revalidatePath('/dashboard/recruitment');
        return { success: true, data: candidate };
    } catch (error) {
        console.error('Error registering candidate internal:', error);
        return { success: false, error: 'Falha ao registrar candidato (E-mail duplicado?)' };
    }
}

/**
 * Public candidate registration (used by Careers Site)
 * NO AUTH required. Source is hardcoded to "Site".
 * Only essential fields are allowed.
 */
export async function registerCandidatePublic(data: {
    name: string;
    email: string;
    phone?: string;
    linkedin?: string;
    resumeUrl: string;
    jobId: string;
}) {
    // Basic validation
    if (!data.name || !data.email || !data.resumeUrl || !data.jobId) {
        return { success: false, error: 'Dados incompletos para candidatura.' };
    }

    try {
        // Find existing candidate or create new one
        const candidate = await prisma.candidate.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                phone: data.phone || undefined,
                linkedin: data.linkedin || undefined,
                resumeUrl: data.resumeUrl,
            },
            create: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                linkedin: data.linkedin,
                resumeUrl: data.resumeUrl,
                source: 'Site'
            }
        });

        // Check if already applied to this specific job
        const existingApp = await prisma.jobApplication.findFirst({
            where: {
                candidateId: candidate.id,
                jobId: data.jobId
            }
        });

        if (!existingApp) {
            await prisma.jobApplication.create({
                data: {
                    jobId: data.jobId,
                    candidateId: candidate.id,
                    status: 'NEW'
                }
            });
        }

        revalidatePath('/dashboard/recruitment');
        return { success: true };
    } catch (error) {
        console.error('Error registering candidate public:', error);
        return { success: false, error: 'Erro ao processar sua candidatura. Tente novamente.' };
    }
}

export async function moveApplication(applicationId: string, newStatus: string) {
    const user = await requireAuth(['ADMIN', 'HR']);

    try {
        const app = await prisma.jobApplication.update({
            where: { id: applicationId },
            data: { status: newStatus }
        });

        revalidatePath('/dashboard/recruitment');
        return { success: true, data: app };
    } catch (error) {
        return { success: false, error: 'Failed to update status' };
    }
}

export async function getJobDetails(jobId: string) {
    if (!jobId) return { success: false, error: 'Job ID is required' };

    try {
        // Only include applications if the user is authenticated and is HR/Admin
        let includeApplications = false;
        try {
            await requireAuth(['ADMIN', 'HR']);
            includeApplications = true;
        } catch (e) {
            includeApplications = false;
        }

        const job = await prisma.jobOpening.findUnique({
            where: { id: jobId },
            include: includeApplications ? {
                applications: {
                    include: {
                        candidate: true
                    },
                    orderBy: { appliedAt: 'desc' }
                }
            } : undefined
        });

        return { success: true, data: job };
    } catch (error) {
        console.error('Error fetching job details:', error);
        return { success: false, error: 'Failed to fetch job details' };
    }
}
