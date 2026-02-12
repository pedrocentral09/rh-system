'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { checkAdminAccess, checkHRAccess } from '@/modules/core/utils/auth-helpers';
import { logAction } from './audit';

// List all users
export async function getUsers() {
    try {
        const currentUser = await getCurrentUser();
        // Allow HR_MANAGER or ADMIN to view users? Or just ADMIN?
        // Let's restrict USER list to ADMIN only for now.
        if (!currentUser) {
            return { success: false, error: 'Usuário não autenticado.' };
        }

        if (!currentUser || !checkHRAccess(currentUser)) {
            // For strict security, throw or return empty.
            // But maybe HR needs to see it? Let's say only ADMIN can manage USERS.
            return { success: false, error: 'Acesso negado. Apenas Gestores e Administradores.' };
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                employee: true,
                roleDef: true,
                storeAccess: {
                    include: { store: true }
                }
            }
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
        if (!currentUser || !checkHRAccess(currentUser)) {
            return { success: false, error: 'Acesso negado.' };
        }

        const oldUser = await prisma.user.findUnique({ where: { id: userId } });

        await prisma.user.update({
            where: { id: userId },
            data: {
                role: role, // Keep legacy field updated for now
                roleId: role === 'ADMIN' ? null : role // If it's a UUID, it's a dynamic role
            }
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

// Update User Store Access
export async function updateUserStoreAccess(userId: string, storeIds: string[]) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !checkHRAccess(currentUser)) {
            return { success: false, error: 'Acesso negado.' };
        }

        // Transactions to ensure consistency
        await prisma.$transaction([
            // Delete old access
            prisma.userStoreAccess.deleteMany({
                where: { userId }
            }),
            // Create new access
            prisma.userStoreAccess.createMany({
                data: storeIds.map(storeId => ({
                    userId,
                    storeId
                }))
            })
        ]);

        await logAction('UPDATE_STORE_ACCESS', 'User', { userId, storeIds }, currentUser.id);
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error updating store access:', error);
        return { success: false, error: 'Failed' };
    }
}

// Delete User
export async function deleteUser(userId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !checkAdminAccess(currentUser)) {
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
