'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/modules/core/actions/auth';
import { logAction } from '@/modules/core/actions/audit';

export async function createJob(data: any) {
    const user = await requireAuth(['ADMIN', 'HR', 'MANAGER']);

    try {
        const job = await prisma.jobOpening.create({
            data: {
                title: data.title,
                department: data.department,
                description: data.description,
                type: data.type,
                status: 'OPEN',
                salaryRangeMin: data.salaryRangeMin ? Number(data.salaryRangeMin) : null,
                salaryRangeMax: data.salaryRangeMax ? Number(data.salaryRangeMax) : null,
            }
        });

        await logAction('CREATE', 'JobOpening', { id: job.id, title: job.title }, user.id);
        revalidatePath('/dashboard/recruitment');
        return { success: true, data: job };
    } catch (error) {
        console.error('Error creating job:', error);
        return { success: false, error: 'Failed to create job opening' };
    }
}

export async function getJobs() {
    await requireAuth(['ADMIN', 'HR', 'MANAGER']);

    const jobs = await prisma.jobOpening.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { applications: true }
            }
        }
    });

    return { success: true, data: jobs };
}

/**
 * Public view of jobs.
 * Excludes sensitive fields and application counts.
 */
export async function getPublicJobs() {
    try {
        const jobs = await prisma.jobOpening.findMany({
            where: { status: 'OPEN' },
            select: {
                id: true,
                title: true,
                department: true,
                type: true,
                status: true,
                // Do NOT include application count or other internal data
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: jobs };
    } catch (error) {
        console.error('Error fetching public jobs:', error);
        return { success: false, error: 'Failed to fetch job openings' };
    }
}

export async function getTalentBankJob() {
    try {
        let talentBank = await prisma.jobOpening.findFirst({
            where: { title: 'Banco de Talentos' }
        });

        if (!talentBank) {
            talentBank = await prisma.jobOpening.create({
                data: {
                    title: 'Banco de Talentos',
                    department: 'Geral',
                    description: 'Cadastre seu currículo em nosso banco de talentos para futuras oportunidades.',
                    status: 'OPEN',
                    type: 'CLT'
                }
            });
        }

        return { success: true, data: talentBank };
    } catch (error) {
        console.error('Error getting talent bank job:', error);
        return { success: false, error: 'Failed to get talent bank' };
    }
}
export async function getPublicJobDetails(jobId: string) {
    if (!jobId) return { success: false, error: 'Job ID is required' };

    try {
        const job = await prisma.jobOpening.findUnique({
            where: { id: jobId, status: 'OPEN' },
            select: {
                id: true,
                title: true,
                department: true,
                description: true,
                requirements: true,
                type: true,
                //applications: false // Explicitly no applications
            }
        });

        if (!job) return { success: false, error: 'Vaga não encontrada ou encerrada.' };

        return { success: true, data: job };
    } catch (error) {
        console.error('Error fetching public job details:', error);
        return { success: false, error: 'Failed to fetch job details' };
    }
}
