'use server';

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
    try {
        const [
            totalEmployees,
            activeEmployees,
            terminatedEmployees,
            stores,
            allActiveEmployees
        ] = await Promise.all([
            prisma.employee.count(),
            prisma.employee.count({ where: { status: 'ACTIVE' } }),
            prisma.employee.count({ where: { status: 'TERMINATED' } }),
            prisma.store.findMany({ select: { id: true } }),
            prisma.employee.findMany({
                where: { status: 'ACTIVE' },
                select: {
                    id: true,
                    name: true,
                    dateOfBirth: true,
                    department: true,
                    photoUrl: true,
                    hireDate: true // Added for probation check
                }
            })
        ]);

        // Process Birthdays
        const currentMonth = new Date().getMonth();
        const upcomingBirthdays = allActiveEmployees
            .filter(e => new Date(e.dateOfBirth).getMonth() === currentMonth)
            .map(e => ({
                ...e,
                day: new Date(e.dateOfBirth).getDate()
            }))
            .sort((a, b) => a.day - b.day);

        // Process Department Distribution
        const deptMap: Record<string, number> = {};
        allActiveEmployees.forEach(e => {
            const dept = e.department || 'Sem Dept.';
            deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const departmentStats = Object.entries(deptMap)
            .map(([name, count]) => ({ name, count, percentage: Math.round((count / allActiveEmployees.length) * 100) }))
            .sort((a, b) => b.count - a.count);

        // Process Probation Alerts (Experiência)
        // Rules: 45 days (1st period) and 90 days (2nd period)
        const today = new Date();
        const probationAlerts = allActiveEmployees
            .map(e => {
                const hire = new Date(e.hireDate);
                const diffTime = Math.abs(today.getTime() - hire.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return { ...e, diffDays };
            })
            .filter(e => {
                // Alert if approaching 45 days (e.g., 40-45) or 90 days (e.g., 85-90)
                // Filter only those in probation (< 90 days) who are close to a deadline
                return (e.diffDays >= 35 && e.diffDays <= 45) || (e.diffDays >= 80 && e.diffDays <= 90);
            })
            .map(e => ({
                id: e.id,
                name: e.name,
                photoUrl: e.photoUrl,
                days: e.diffDays,
                period: e.diffDays <= 45 ? '1º Período (45d)' : '2º Período (90d)'
            }))
            .sort((a, b) => b.days - a.days);

        return {
            success: true,
            data: {
                totalEmployees,
                activeEmployees,
                terminatedEmployees,
                storeCount: stores.length,
                departmentCount: Object.keys(deptMap).length,
                upcomingBirthdays: upcomingBirthdays.slice(0, 5),
                birthdaysCount: upcomingBirthdays.length,
                departmentStats,
                probationAlerts
            }
        };
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return { success: false, error: 'Failed to load stats' };
    }
}

export async function getHiringStats() {
    try {
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of that month

        const [hired, terminated] = await Promise.all([
            prisma.employee.findMany({
                where: { hireDate: { gte: sixMonthsAgo } },
                select: { hireDate: true }
            }),
            prisma.contract.findMany({
                where: { terminationDate: { gte: sixMonthsAgo } },
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

        hired.forEach(e => {
            const d = new Date(e.hireDate);
            const key = `${d.getMonth()}-${d.getFullYear()}`;
            if (statsMap.has(key)) {
                statsMap.get(key)!.hired++;
            }
        });

        terminated.forEach(c => {
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
