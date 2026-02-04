
'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/modules/core/actions/auth';

export async function getCandidates(query?: string) {
    await requireAuth();

    const candidates = await prisma.candidate.findMany({
        where: query ? {
            OR: [
                { name: { contains: query } }, // SQLite doesn't support mode: 'insensitive' easily with Prisma? Use default
                { email: { contains: query } }
            ]
        } : undefined,
        include: {
            applications: {
                include: {
                    job: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return { success: true, data: candidates };
}
