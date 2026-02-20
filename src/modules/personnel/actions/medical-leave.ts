'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { parseSafeDate } from '@/shared/utils/date-utils';

export async function createMedicalLeave(data: any) {
    try {
        const leave = await prisma.medicalLeave.create({
            data: {
                employeeId: data.employeeId,
                type: data.type,
                startDate: parseSafeDate(data.startDate)!,
                endDate: parseSafeDate(data.endDate)!,
                daysCount: parseInt(data.daysCount),
                crm: data.crm || null,
                doctorName: data.doctorName || null,
                cid: data.cid || null,
                documentUrl: data.documentUrl,
                status: data.status || 'APPROVED', // HR bypasses approval by default
                submittedByType: data.submittedByType || 'HR',
                submittedById: data.submittedById,
                notes: data.notes || null,
            }
        });

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/personnel');
        revalidatePath('/dashboard/vacations');

        return { success: true, data: leave };
    } catch (error) {
        console.error('Error creating medical leave:', error);
        return { success: false, error: 'Erro ao registrar atestado.' };
    }
}

export async function getMedicalLeaves(employeeId: string) {
    try {
        const leaves = await prisma.medicalLeave.findMany({
            where: { employeeId },
            orderBy: { startDate: 'desc' }
        });
        return { success: true, data: leaves };
    } catch (error) {
        console.error('Error fetching medical leaves:', error);
        return { success: false, error: 'Erro ao buscar atestados.' };
    }
}

export async function deleteMedicalLeave(id: string) {
    try {
        await prisma.medicalLeave.delete({
            where: { id }
        });
        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error deleting medical leave:', error);
        return { success: false, error: 'Erro ao excluir atestado.' };
    }
}

export async function getAllMedicalLeaves() {
    try {
        const leaves = await prisma.medicalLeave.findMany({
            include: {
                employee: {
                    select: {
                        name: true,
                        photoUrl: true,
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        });
        return { success: true, data: leaves };
    } catch (error) {
        console.error('Error fetching all medical leaves:', error);
        return { success: false, error: 'Erro ao buscar atestados.' };
    }
}
