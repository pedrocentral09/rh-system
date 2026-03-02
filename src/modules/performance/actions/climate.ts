'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function submitClimateSurvey(data: { score: number; comment?: string; department?: string }) {
    try {
        const survey = await prisma.climateSurvey.create({
            data: {
                score: data.score,
                comment: data.comment,
                department: data.department,
            },
        });

        revalidatePath('/dashboard/performance');
        return { success: true, data: survey };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClimateSurveys() {
    try {
        const surveys = await prisma.climateSurvey.findMany({
            orderBy: { date: 'desc' },
            take: 100, // Limit to recent ones for performance
        });

        // Calculate current e-NPS
        // Promoters (9-10), Passives (7-8), Detractors (0-6)
        // NPS = % Promoters - % Detractors
        let promoters = 0;
        let detractors = 0;
        const total = surveys.length;

        surveys.forEach(s => {
            if (s.score >= 9) promoters++;
            if (s.score <= 6) detractors++;
        });

        const npsScore = total > 0 ? Math.round(((promoters / total) - (detractors / total)) * 100) : 0;

        return {
            success: true,
            data: {
                surveys,
                stats: {
                    total,
                    promoters,
                    detractors,
                    passives: total - promoters - detractors,
                    npsScore
                }
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
