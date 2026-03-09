'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/modules/core/actions/auth';
import { revalidatePath } from 'next/cache';

export async function getNotificationsAction() {
    try {
        const user = await requireAuth();

        const notifications = await (prisma as any).notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return { success: true, data: notifications };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markNotificationAsReadAction(notificationId: string) {
    try {
        const user = await requireAuth();

        await (prisma as any).notification.update({
            where: { id: notificationId, userId: user.id },
            data: { isRead: true }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createNotificationAction(data: {
    userId: string;
    title: string;
    message: string;
    type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'URGENT';
    link?: string;
}) {
    try {
        // This is an internal tool action, usually called by other server actions
        const notification = await (prisma as any).notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type || 'INFO',
                link: data.link,
                isRead: false
            }
        });

        return { success: true, data: notification };
    } catch (error: any) {
        console.error('[createNotificationAction] error:', error);
        return { success: false, error: error.message };
    }
}

export async function clearAllNotificationsAction() {
    try {
        const user = await requireAuth();

        await (prisma as any).notification.deleteMany({
            where: { userId: user.id }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
