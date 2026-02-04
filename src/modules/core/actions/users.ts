'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { logAction } from './audit';

// List all users
export async function getUsers() {
    try {
        const currentUser = await getCurrentUser();
        // Allow HR_MANAGER or ADMIN to view users? Or just ADMIN?
        // Let's restrict USER list to ADMIN only for now.
        if (!currentUser || currentUser.role !== 'ADMIN') {
            // For strict security, throw or return empty.
            // But maybe HR needs to see it? Let's say only ADMIN can manage USERS.
            return { success: false, error: 'Acesso negado. Apenas Administradores.' };
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: { employee: true }
        });
        return { success: true, data: users };
    } catch (error) {
        console.error('Error fetching users:', error);
        return { success: false, error: 'Failed' };
    }
}

// Update Role
export async function updateUserRole(userId: string, role: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Acesso negado.' };
        }

        const oldUser = await prisma.user.findUnique({ where: { id: userId } });

        await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        await logAction(
            'UPDATE_ROLE',
            'User',
            { targetUser: userId, oldRole: oldUser?.role, newRole: role },
            currentUser.id
        );

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error updating role:', error);
        return { success: false, error: 'Failed' };
    }
}

// Delete User
export async function deleteUser(userId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Acesso negado.' };
        }

        // Prevent self-delete
        if (userId === currentUser.id) {
            return { success: false, error: 'Você não pode excluir a si mesmo.' };
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        await logAction('DELETE_USER', 'User', { targetUser: userId }, currentUser.id);

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error deleting user:', error);
        return { success: false, error: 'Failed' };
    }
}
