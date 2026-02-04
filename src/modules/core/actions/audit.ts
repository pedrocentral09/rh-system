'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function logAction(
    action: string,
    resource: string,
    details: any,
    userId?: string
) {
    try {
        // Try to get IP from headers
        const headersList = await headers();
        const ip = headersList.get('x-forwarded-for') || 'unknown';

        await prisma.auditLog.create({
            data: {
                action,
                resource,
                details: typeof details === 'string' ? details : JSON.stringify(details),
                ipAddress: ip,
                userId: userId || 'SYSTEM', // If not provided, assume system/anonymous
            }
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // Do not throw, so we don't block the main action
    }
}

export async function getAuditLogs() {
    try {
        const logs = await prisma.auditLog.findMany({
            take: 100,
            orderBy: { timestamp: 'desc' },
            include: { user: { select: { name: true, email: true } } }
        });
        return { success: true, data: logs };
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return { success: false, error: 'Failed' };
    }
}
