
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/modules/core/actions/auth';
import { logAction } from '@/modules/core/actions/audit';

export async function registerCandidate(data: any) {
    // This might be public or internal. For now, let's assume internal HR usage.
    const user = await requireAuth(['ADMIN', 'HR']);

    try {
        const candidate = await prisma.candidate.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                linkedin: data.linkedin,
                notes: data.notes,
                // resumeUrl: ... (Need file upload logic later)
            }
        });

        // Optionally create an application immediately if jobId is provided
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
        console.error('Error registering candidate:', error);
        return { success: false, error: 'Failed to register candidate (Email might be duplicate)' };
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
    await requireAuth();

    const job = await prisma.jobOpening.findUnique({
        where: { id: jobId },
        include: {
            applications: {
                include: {
                    candidate: true
                },
                orderBy: { appliedAt: 'desc' }
            }
        }
    });

    return { success: true, data: job };
}
