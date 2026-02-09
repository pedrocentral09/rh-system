import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import { unstable_cache } from 'next/cache';

export class StatsService extends BaseService {

    /**
     * Get dashboard stats with optional caching
     */
    static async getDashboardData(filters?: { companyId?: string, storeId?: string, sigStatus?: string }): Promise<ServiceResult<any>> {
        try {
            // Define the fetcher function
            const fetcher = async () => {
                const whereClause: any = { status: 'ACTIVE' };
                if (filters?.companyId) whereClause.contract = { companyId: filters.companyId };
                if (filters?.storeId) {
                    whereClause.contract = { ...whereClause.contract, storeId: filters.storeId };
                }
                if (filters?.sigStatus && filters.sigStatus !== 'all') {
                    whereClause.documents = {
                        some: { status: filters.sigStatus }
                    };
                }

                const [
                    totalEmployees,
                    activeEmployees,
                    terminatedEmployees,
                    stores,
                    allActiveEmployees
                ] = await Promise.all([
                    prisma.employee.count(),
                    prisma.employee.count({ where: { status: 'ACTIVE', ...whereClause } }),
                    prisma.employee.count({ where: { status: 'TERMINATED' } }),
                    prisma.store.findMany({ select: { id: true, name: true } }),
                    prisma.employee.findMany({
                        where: whereClause,
                        select: {
                            id: true,
                            name: true,
                            dateOfBirth: true,
                            department: true,
                            photoUrl: true,
                            hireDate: true
                        }
                    })
                ]);

                // Process internal logic (Birthdays, Probation, etc.)
                const today = new Date();
                const currentMonth = today.getMonth();

                const upcomingBirthdays = allActiveEmployees
                    .filter(e => e.dateOfBirth && new Date(e.dateOfBirth).getMonth() === currentMonth)
                    .map(e => ({
                        id: e.id,
                        name: e.name,
                        photoUrl: e.photoUrl,
                        day: new Date(e.dateOfBirth).getDate()
                    }))
                    .sort((a, b) => a.day - b.day);

                const deptMap: Record<string, number> = {};
                allActiveEmployees.forEach(e => {
                    const dept = e.department || 'Outros';
                    deptMap[dept] = (deptMap[dept] || 0) + 1;
                });

                const probationAlerts = allActiveEmployees
                    .map(e => {
                        if (!e.hireDate) return null;
                        const hire = new Date(e.hireDate);
                        const diffDays = Math.ceil(Math.abs(today.getTime() - hire.getTime()) / (1000 * 60 * 60 * 24));
                        return { id: e.id, name: e.name, photoUrl: e.photoUrl, days: diffDays };
                    })
                    .filter((e): e is { id: string, name: string, photoUrl: string | null, days: number } => e !== null)
                    .filter(e => (e.days >= 35 && e.days <= 45) || (e.days >= 80 && e.days <= 90))
                    .map(e => ({
                        ...e,
                        period: e.days <= 45 ? '1º Período (45d)' : '2º Período (90d)'
                    }));

                return {
                    totalEmployees,
                    activeEmployees,
                    terminatedEmployees,
                    storeCount: stores.length,
                    departmentCount: Object.keys(deptMap).length,
                    upcomingBirthdays: upcomingBirthdays.slice(0, 5),
                    probationAlerts,
                    departmentStats: Object.entries(deptMap).map(([name, count]) => ({
                        name,
                        count,
                        percentage: Math.round((count / allActiveEmployees.length) * 100)
                    })).sort((a, b) => b.count - a.count)
                };
            };

            let data;
            try {
                // Use Next.js caching
                const getCachedData = unstable_cache(
                    fetcher,
                    [`dashboard-stats-${filters?.companyId || 'all'}-${filters?.storeId || 'all'}`],
                    { revalidate: 300, tags: ['stats'] } // Cache for 5 mins
                );
                data = await getCachedData();
            } catch (e) {
                // FALLBACK: If unstable_cache fails (e.g. running in a standalone script), call fetcher directly
                console.log('Skipping unstable_cache: No Next.js context. Falling back to direct fetch.');
                data = await fetcher();
            }

            const serialized = JSON.parse(JSON.stringify(data));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Erro ao calcular estatísticas do dashboard');
        }
    }
}
