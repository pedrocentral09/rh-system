'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { checkAdminAccess } from '@/modules/core/utils/auth-helpers';

export async function getManagerOneOnOnes() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        // Find Employee ID
        const employee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!employee) return { success: false, error: 'Perfil de colaborador não encontrado.' };

        // Check if user is an ADMIN, then they can see all. Otherwise, only theirs.
        const isGlobalAdmin = checkAdminAccess(user);

        const oneOnOnes = await prisma.oneOnOne.findMany({
            where: isGlobalAdmin ? {} : { managerId: employee.id },
            include: {
                employee: { select: { id: true, name: true, jobRole: { select: { name: true } } } },
                manager: { select: { id: true, name: true } }
            },
            orderBy: { date: 'desc' }
        });

        return { success: true, data: oneOnOnes };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createOneOnOne(data: { employeeId: string; date: Date; content: string; actionItems?: string; feeling?: string }) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        const manager = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!manager) return { success: false, error: 'Gestor não encontrado no sistema.' };

        const oneOnOne = await prisma.oneOnOne.create({
            data: {
                managerId: manager.id,
                employeeId: data.employeeId,
                date: data.date,
                content: data.content,
                actionItems: data.actionItems,
                feeling: data.feeling,
            }
        });

        revalidatePath('/dashboard/performance/1on1');
        return { success: true, data: oneOnOne };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteOneOnOne(id: string) {
    try {
        await prisma.oneOnOne.delete({ where: { id } });
        revalidatePath('/dashboard/performance/1on1');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
