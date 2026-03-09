'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/modules/core/actions/auth';
import { parseSafeDate } from '@/shared/utils/date-utils';

export async function createMedicalLeave(data: any) {
    try {
        console.log('[createMedicalLeave] Incoming data:', data);
        const user = await getCurrentUser();

        const startDate = parseSafeDate(data.startDate);
        const endDate = parseSafeDate(data.endDate);

        if (!startDate) throw new Error('Data de início inválida.');
        if (!endDate) throw new Error('Data de término inválida.');

        const daysCount = typeof data.daysCount === 'string' ? parseInt(data.daysCount) : data.daysCount;

        if (isNaN(daysCount)) throw new Error('Número de dias inválido.');

        const leave = await prisma.medicalLeave.create({
            data: {
                employeeId: data.employeeId,
                type: data.type,
                startDate,
                endDate,
                daysCount,
                crm: data.crm ? String(data.crm).trim() : null,
                doctorName: data.doctorName ? String(data.doctorName).trim() : null,
                cid: data.cid ? String(data.cid).trim().toUpperCase() : null,
                documentUrl: data.documentUrl,
                status: data.status || 'APPROVED',
                submittedByType: data.submittedByType || 'HR',
                submittedById: data.submittedById || user?.id || 'system',
                notes: data.notes ? String(data.notes).trim() : null,
            }
        });

        console.log('[createMedicalLeave] Success:', leave.id);

        revalidatePath('/dashboard');
        revalidatePath('/dashboard/personnel');
        revalidatePath('/dashboard/vacations');

        return { success: true, data: leave };
    } catch (error: any) {
        console.error('Error creating medical leave:', error);
        return {
            success: false,
            error: error.message || 'Erro ao registrar atestado no banco de dados.'
        };
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
