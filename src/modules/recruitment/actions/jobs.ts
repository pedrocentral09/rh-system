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
    await requireAuth();

    // TODO: Add filters
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
