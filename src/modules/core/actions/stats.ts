'use server';

import { prisma } from '@/lib/prisma';

import { StatsService } from '../services/stats.service';

export async function getDashboardStats(filters?: { companyId?: string, storeId?: string }) {
    const result = await StatsService.getDashboardData(filters);
    return result;
}

export async function getHiringStats(filters?: { companyId?: string, storeId?: string }) {
    // Note: getHiringStats logic can also be moved to StatsService for consistency.
    // For now, let's keep it simple or migrate it too.
    // Since the goal is performance, I'll migrate it to StatsService in the next step if needed.
    // But for now, let's just make sure getDashboardStats is fast.
    try {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        const hiredWhere: any = { hireDate: { gte: sixMonthsAgo } };
        const terminatedWhere: any = { terminationDate: { gte: sixMonthsAgo } };

        if (filters?.companyId) {
            hiredWhere.contract = { ...hiredWhere.contract, companyId: filters.companyId };
            terminatedWhere.companyId = filters.companyId;
        }
        if (filters?.storeId) {
            hiredWhere.contract = { ...hiredWhere.contract, storeId: filters.storeId };
            terminatedWhere.storeId = filters.storeId;
        }

        const [hired, terminated] = await Promise.all([
            prisma.employee.findMany({
                where: hiredWhere,
                select: { hireDate: true }
            }),
            prisma.contract.findMany({
                where: terminatedWhere,
                select: { terminationDate: true }
            })
        ]);

        // Group by Month (Format: "MMM/YY")
        const statsMap = new Map<string, { month: string, hired: number, terminated: number, sortKey: number }>();

        // Initialize last 6 months
        for (let i = 0; i < 6; i++) {
            const d = new Date(sixMonthsAgo);
            d.setMonth(sixMonthsAgo.getMonth() + i);
            const key = `${d.getMonth()}-${d.getFullYear()}`;
            const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).toUpperCase().replace('.', '');
            statsMap.set(key, { month: label, hired: 0, terminated: 0, sortKey: d.getTime() });
        }

        hired.forEach((e: any) => {
            const d = new Date(e.hireDate);
            const key = `${d.getMonth()}-${d.getFullYear()}`;
            if (statsMap.has(key)) {
                statsMap.get(key)!.hired++;
            }
        });

        terminated.forEach((c: any) => {
            if (c.terminationDate) {
                const d = new Date(c.terminationDate);
                const key = `${d.getMonth()}-${d.getFullYear()}`;
                if (statsMap.has(key)) {
                    statsMap.get(key)!.terminated++;
                }
            }
        });

        const chartData = Array.from(statsMap.values()).sort((a, b) => a.sortKey - b.sortKey);

        return { success: true, data: chartData };
    } catch (error) {
        console.error('Error fetching hiring stats:', error);
        return { success: false, error: 'Failed' };
    }
}
