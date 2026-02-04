'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { logAction } from './audit';
import { z } from 'zod';

const RoleSchema = z.object({
    name: z.string().min(2),
    permissions: z.record(z.string(), z.array(z.string())), // { "module": ["read"] }
    description: z.string().optional(),
});

export async function getRoles() {
    try {
        const roles = await prisma.role.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { users: true } } }
        });
        return { success: true, data: roles };
    } catch (error) {
        console.error('Error fetching roles:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function createRole(data: z.infer<typeof RoleSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Denied' };
        }

        const validData = RoleSchema.parse(data);

        const newRole = await prisma.role.create({
            data: {
                name: validData.name,
                permissions: JSON.stringify(validData.permissions),
                description: validData.description,
            }
        });

        await logAction('CREATE_ROLE', 'Role', { id: newRole.id, name: newRole.name }, currentUser.id);
        revalidatePath('/dashboard/configuration');
        return { success: true, data: newRole };
    } catch (error) {
        return { success: false, error: 'Failed to create role' };
    }
}

export async function deleteRole(roleId: string) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') return { success: false, error: 'Denied' };

        const role = await prisma.role.findUnique({ where: { id: roleId }, include: { _count: { select: { users: true } } } });

        if (!role) return { success: false, error: 'Not found' };
        if (role.isSystem) return { success: false, error: 'Cannot delete system role' };
        if (role._count.users > 0) return { success: false, error: 'Role has active users' };

        await prisma.role.delete({ where: { id: roleId } });
        await logAction('DELETE_ROLE', 'Role', { id: roleId, name: role.name }, currentUser.id);

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
