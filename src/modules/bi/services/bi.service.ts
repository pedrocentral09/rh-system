import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';

export class BIService extends BaseService {
    /**
     * Get Advanced BI Intelligence
     */
    static async getBIIntel(filters?: { companyId?: string, storeId?: string }): Promise<ServiceResult<any>> {
        try {
            const baseContractFilter: any = {};
            if (filters?.companyId) baseContractFilter.companyId = filters.companyId;
            if (filters?.storeId) baseContractFilter.storeId = filters.storeId;

            const baseWhere: any = {};
            if (Object.keys(baseContractFilter).length > 0) {
                baseWhere.contract = baseContractFilter;
            }

            const now = new Date();
            const twelveMonthsAgo = new Date();
            twelveMonthsAgo.setMonth(now.getMonth() - 11);
            twelveMonthsAgo.setDate(1);

            // 1. Fetch historical data for Turnover
            const [
                activeCount,
                hiredLast12,
                terminatedLast12,
                payrollData,
                absenteeismData
            ] = await Promise.all([
                prisma.employee.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
                prisma.employee.count({
                    where: {
                        ...baseWhere,
                        hireDate: { gte: twelveMonthsAgo }
                    }
                }),
                prisma.contract.count({
                    where: {
                        ...baseContractFilter,
                        terminationDate: { gte: twelveMonthsAgo }
                    }
                }),
                prisma.contract.findMany({
                    where: {
                        ...baseContractFilter,
                        employee: { status: 'ACTIVE' }
                    },
                    select: { baseSalary: true }
                }),
                prisma.medicalLeave.aggregate({
                    where: {
                        employee: { ...baseWhere, status: 'ACTIVE' },
                        startDate: { gte: twelveMonthsAgo }
                    },
                    _sum: { daysCount: true }
                })
            ]);

            // 2. Turnover Calculation (Terminations / Avg Headcount)
            const approxAvgHeadcount = activeCount > 0 ? activeCount : 1;
            const turnoverRate = Number(((terminatedLast12 / approxAvgHeadcount) * 100).toFixed(2));

            // 3. Financial Metrics
            const totalMonthlyBaseSalary = payrollData.reduce((acc, curr) => acc + Number(curr.baseSalary), 0);
            const estimatedSocialCharges = totalMonthlyBaseSalary * 0.4;
            const totalMonthlyProvision = totalMonthlyBaseSalary + estimatedSocialCharges;

            // 4. Absenteeism Rate
            const totalPotentialDays = activeCount * 250;
            const absenteeismRate = totalPotentialDays > 0
                ? Number(((Number(absenteeismData._sum.daysCount || 0) / totalPotentialDays) * 100).toFixed(2))
                : 0;

            // 5. Retention Rate
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            const retainedOverOneYear = await prisma.employee.count({
                where: {
                    ...baseWhere,
                    status: 'ACTIVE',
                    hireDate: { lte: oneYearAgo }
                }
            });
            const retentionRate = activeCount > 0 ? Number(((retainedOverOneYear / activeCount) * 100).toFixed(2)) : 0;

            return this.success({
                turnoverRate,
                retentionRate,
                absenteeismRate,
                financials: {
                    monthlyBaseSalary: totalMonthlyBaseSalary,
                    estimatedCharges: estimatedSocialCharges,
                    totalProvision: totalMonthlyProvision
                },
                headcount: {
                    active: activeCount,
                    hiredYear: hiredLast12,
                    terminatedYear: terminatedLast12
                }
            });
        } catch (error) {
            return this.error(error, 'Erro ao computar BI Intel');
        }
    }

    /**
     * Get Productivity Heatmap (Punches by Hour and Day)
     */
    static async getProductivityHeatmap(filters?: { storeId?: string }): Promise<ServiceResult<any>> {
        try {
            const records = await prisma.timeRecord.findMany({
                where: {
                    employee: filters?.storeId ? { contract: { storeId: filters.storeId } } : undefined
                },
                select: { date: true, time: true }
            });

            // 7 days x 24 hours
            const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

            records.forEach(r => {
                const hour = parseInt(r.time.split(':')[0]);
                const d = new Date(r.date);
                const day = d.getUTCDay(); // 0-6 (Sun-Sat)
                if (hour >= 0 && hour < 24) {
                    heatmap[day][hour]++;
                }
            });

            return this.success(heatmap);
        } catch (error) {
            return this.error(error, 'Erro ao gerar heatmap de produtividade');
        }
    }
}
