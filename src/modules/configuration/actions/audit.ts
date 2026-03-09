'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/modules/core/actions/auth';

export async function getAuditLogsAction(filters?: {
    userId?: string;
    module?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    pageSize?: number;
}) {
    try {
        await requireAuth(['ADMIN']);

        const page = filters?.page || 1;
        const pageSize = filters?.pageSize || 20;
        const skip = (page - 1) * pageSize;

        const where: any = {};
        if (filters?.userId) where.userId = filters.userId;
        if (filters?.module) where.module = filters.module;
        if (filters?.action) where.action = filters.action;

        if (filters?.startDate || filters?.endDate) {
            where.timestamp = {};
            if (filters?.startDate) where.timestamp.gte = filters.startDate;
            if (filters?.endDate) where.timestamp.lte = filters.endDate;
        }

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { name: true, email: true, role: true }
                    }
                },
                orderBy: { timestamp: 'desc' },
                skip,
                take: pageSize
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            success: true,
            data: {
                logs,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize)
            }
        };
    } catch (error: any) {
        console.error('[getAuditLogsAction] error:', error);
        return { success: false, error: error.message };
    }
}

export async function getAuditSummaryAction() {
    try {
        await requireAuth(['ADMIN']);

        const [last24h, totalCount, topUsers] = await Promise.all([
            prisma.auditLog.count({
                where: {
                    timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                }
            }),
            prisma.auditLog.count(),
            prisma.auditLog.groupBy({
                by: ['userId'],
                _count: { userId: true },
                orderBy: { _count: { userId: 'desc' } },
                take: 5
            })
        ]);

        return {
            success: true,
            data: {
                last24h,
                totalCount,
                topUsers
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
