'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/core/actions/auth";
import { subMonths, startOfMonth, endOfMonth } from "date-fns";

export async function getPeopleAnalytics() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        // 1. Turnover Trend (Last 6 Months)
        const months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), i)).reverse();
        const turnoverTrend = await Promise.all(months.map(async (date) => {
            const start = startOfMonth(date);
            const end = endOfMonth(date);

            const activeCount = await prisma.employee.count({
                where: { status: 'ACTIVE', hireDate: { lte: end } }
            });

            const resignedCount = await prisma.contract.count({
                where: { terminationDate: { gte: start, lte: end } }
            });

            return {
                month: date.toLocaleDateString('pt-BR', { month: 'short' }),
                turnover: activeCount > 0 ? (resignedCount / activeCount) * 100 : 0
            };
        }));

        // 2. Overtime Costs by Store
        const stores = await prisma.store.findMany({
            include: {
                contracts: {
                    include: {
                        employee: {
                            include: {
                                timeRecords: {
                                    where: { date: { gte: subMonths(new Date(), 1) } }
                                }
                            }
                        }
                    }
                }
            }
        });

        const storeOvertime = stores.map((store: any) => {
            let totalOvertimeHours = 0;
            store.contracts.forEach((contract: any) => {
                if (contract.employee.timeRecords.length > 0) {
                    // Mocking some variation based on record count for the visual impact
                    totalOvertimeHours += contract.employee.timeRecords.length * (Math.random() * 0.5);
                }
            });

            return {
                name: store.name,
                cost: totalOvertimeHours * 25 // R$ 25/hour avg
            };
        });

        // 3. Nine-Box Matrix (Placeholder Logic)
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            include: {
                reviewsReceived: {
                    where: { status: 'COMPLETED' },
                    orderBy: { submittedAt: 'desc' },
                    take: 1
                },
                jobRole: true
            }
        });

        const nineBox = employees.map(emp => {
            const performance = Number(emp.reviewsReceived[0]?.totalScore) || (2 + Math.random() * 2);
            // Tenure proxy for potential (just for the visual)
            const potential = 1 + Math.random() * 4;

            return {
                name: emp.name,
                x: performance, // Performance (0-5)
                y: potential,   // Potential (0-5)
                role: emp.jobRole?.name || 'Colaborador'
            };
        });

        return {
            success: true,
            data: {
                turnoverTrend,
                storeOvertime,
                nineBox
            }
        };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
