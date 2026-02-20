
'use server';

import { prisma } from '@/lib/prisma';

export async function getPayrollCostTrend() {
    try {
        // Fetch last 6 periods
        const periods = await prisma.payrollPeriod.findMany({
            take: 6,
            orderBy: [{ year: 'asc' }, { month: 'asc' }],
            include: {
                payslips: {
                    select: {
                        grossSalary: true, // This includes Base + Earnings
                        // Or we can sum items. Let's use grossSalary from payslip model snapshot.
                        totalAdditions: true
                    }
                }
            }
        });

        const data = periods.map(p => {
            const totalCost = p.payslips.reduce((acc, curr) => acc + Number(curr.totalAdditions), 0);
            return {
                name: `${p.month}/${p.year}`,
                cost: totalCost
            };
        });

        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch trend' };
    }
}

export async function getCostByDepartment(periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: {
                payslips: {
                    include: {
                        employee: {
                            select: { department: true }
                        }
                    }
                }
            }
        });

        if (!period) return { success: false, error: 'Period not found' };

        // Group by Dept
        const distro: Record<string, number> = {};

        period.payslips.forEach(p => {
            const dept = p.employee.department || 'Sem Depto';
            distro[dept] = (distro[dept] || 0) + Number(p.totalAdditions);
        });

        const data = Object.entries(distro).map(([name, value]) => ({ name, value }));

        return { success: true, data };

    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

export async function getRubricBreakdown(periodId: string) {
    try {
        const items = await prisma.payslipItem.findMany({
            where: { payslip: { periodId } },
            include: { event: true }
        });

        const breakdown: Record<string, { name: string, code: string, type: string, value: number }> = {};

        items.forEach(item => {
            const key = item.eventId;
            if (!breakdown[key]) {
                breakdown[key] = {
                    name: item.name,
                    code: item.event?.code || '---',
                    type: item.type,
                    value: 0
                };
            }
            breakdown[key].value += Number(item.value);
        });

        const data = Object.values(breakdown).sort((a, b) => a.type === 'EARNING' ? -1 : 1);

        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed to fetch breakdown' };
    }
}

export async function getCostByCompany(periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: {
                payslips: {
                    include: {
                        employee: {
                            include: { contract: { include: { company: true } } }
                        }
                    }
                }
            }
        });

        if (!period) return { success: false, error: 'Period not found' };

        const distro: Record<string, number> = {};

        period.payslips.forEach(p => {
            const company = p.employee.contract?.company?.name || 'Sem Empresa';
            distro[company] = (distro[company] || 0) + Number(p.totalAdditions);
        });

        const data = Object.entries(distro).map(([name, value]) => ({ name, value }));
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}

export async function getCostByStore(periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: {
                payslips: {
                    include: {
                        employee: {
                            include: { contract: { include: { store: true } } }
                        }
                    }
                }
            }
        });

        if (!period) return { success: false, error: 'Period not found' };

        const distro: Record<string, number> = {};

        period.payslips.forEach(p => {
            const store = p.employee.contract?.store?.name || 'Sem Loja';
            distro[store] = (distro[store] || 0) + Number(p.totalAdditions);
        });

        const data = Object.entries(distro).map(([name, value]) => ({ name, value }));
        return { success: true, data };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
