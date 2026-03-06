'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// ==========================================
// READ
// ==========================================

export async function getCareerPaths() {
    try {
        const paths = await prisma.careerPath.findMany({
            include: {
                levels: {
                    include: {
                        jobRole: true,
                        requirements: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
        return { success: true, data: paths };
    } catch (error: any) {
        console.error('Error fetching career paths:', error);
        return { success: false, error: error.message };
    }
}

export async function getCareerPath(id: string) {
    try {
        const path = await prisma.careerPath.findUnique({
            where: { id },
            include: {
                levels: {
                    include: {
                        jobRole: true,
                        requirements: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        });
        return { success: true, data: path };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// CREATE
// ==========================================

export async function createCareerPath(data: { name: string; description?: string }) {
    try {
        const path = await prisma.careerPath.create({
            data: {
                name: data.name,
                description: data.description || null,
            },
        });
        revalidatePath('/dashboard/career');
        return { success: true, data: path };
    } catch (error: any) {
        console.error('Error creating career path:', error);
        return { success: false, error: error.message };
    }
}

export async function addCareerLevel(data: {
    careerPathId: string;
    jobRoleId: string;
    order: number;
    minMonths?: number;
    minScore?: number;
    mission?: string;
    responsibilities?: string;
    differential?: string;
    maxAbsences?: number;
    maxDelays?: number;
    maxWarnings?: number;
}) {
    try {
        const level = await prisma.careerLevel.create({
            data: {
                careerPathId: data.careerPathId,
                jobRoleId: data.jobRoleId,
                order: data.order,
                minMonths: data.minMonths || 0,
                minScore: data.minScore || null,
                mission: data.mission || null,
                responsibilities: data.responsibilities || null,
                differential: data.differential || null,
                maxAbsences: data.maxAbsences || null,
                maxDelays: data.maxDelays || null,
                maxWarnings: data.maxWarnings || null,
            },
        });
        revalidatePath('/dashboard/career');
        return { success: true, data: level };
    } catch (error: any) {
        console.error('Error adding career level:', error);
        return { success: false, error: error.message };
    }
}

export async function addCareerRequirement(data: {
    careerLevelId: string;
    type: string;
    description: string;
    value?: string;
}) {
    try {
        const req = await prisma.careerRequirement.create({
            data: {
                careerLevelId: data.careerLevelId,
                type: data.type,
                description: data.description,
                value: data.value || null,
            },
        });
        revalidatePath('/dashboard/career');
        return { success: true, data: req };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// UPDATE
// ==========================================

export async function updateCareerPath(id: string, data: { name?: string; description?: string; isActive?: boolean }) {
    try {
        await prisma.careerPath.update({
            where: { id },
            data,
        });
        revalidatePath('/dashboard/career');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateCareerLevel(id: string, data: {
    minMonths?: number;
    minScore?: number;
    jobRoleId?: string;
    mission?: string;
    responsibilities?: string;
    differential?: string;
    maxAbsences?: number;
    maxDelays?: number;
    maxWarnings?: number;
}) {
    try {
        await prisma.careerLevel.update({
            where: { id },
            data,
        });
        revalidatePath('/dashboard/career');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// DELETE
// ==========================================

export async function deleteCareerPath(id: string) {
    try {
        await prisma.careerPath.delete({ where: { id } });
        revalidatePath('/dashboard/career');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCareerLevel(id: string) {
    try {
        await prisma.careerLevel.delete({ where: { id } });
        revalidatePath('/dashboard/career');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteCareerRequirement(id: string) {
    try {
        await prisma.careerRequirement.delete({ where: { id } });
        revalidatePath('/dashboard/career');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
