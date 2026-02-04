'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addYears, addMonths, isBefore, differenceInDays } from 'date-fns';

export async function getVacationData(employeeId: string) {
    try {
        const periods = await prisma.vacationPeriod.findMany({
            where: { employeeId },
            orderBy: { startDate: 'asc' },
            include: { requests: true }
        });
        return { success: true, data: periods };
    } catch (error) {
        return { success: false, error: 'Failed to fetch vacation data' };
    }
}

// Check and Create Vesting Periods based on Hire Date
export async function checkVacationRights(employeeId: string, shouldRevalidate: boolean = true) {
    try {
        const emp = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: { contract: true }
        });

        if (!emp || !emp.contract?.admissionDate) return { success: false, error: 'Admission date not found' };

        const admission = new Date(emp.contract.admissionDate);
        const now = new Date();
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + 1); // Allow if cursor matches today

        // Loop from admission year to now
        let cursor = new Date(admission);
        let safety = 0;

        while (isBefore(cursor, checkDate) && safety < 50) {
            const periodEnd = addYears(cursor, 1);

            // Check if period exists
            const exists = await prisma.vacationPeriod.findFirst({
                where: {
                    employeeId,
                    startDate: cursor
                }
            });

            if (!exists) {
                // Determine limits
                // Periodo Concessivo ends 11 months after Periodo Aquisitivo ends (usually 23 months from start)
                // Technically 12 months after vesting.
                const limitDate = addMonths(periodEnd, 12);

                await prisma.vacationPeriod.create({
                    data: {
                        employeeId,
                        startDate: cursor,
                        endDate: periodEnd,
                        limitDate: limitDate,
                        vested: isBefore(periodEnd, now),
                        status: isBefore(limitDate, now) ? 'EXPIRED' : (isBefore(periodEnd, now) ? 'OPEN' : 'ACCRUING')
                    }
                });
            }

            cursor = periodEnd;
            safety++;
        }

        if (shouldRevalidate) {
            revalidatePath('/dashboard/personnel');
        }
        return { success: true };
    } catch (error) {
        console.error("Vacation Calc Error:", error);
        return { success: false, error: 'Calc failed' };
    }
}

export async function createVacationRequest(data: {
    employeeId: string,
    periodId: string,
    startDate: Date,
    daysCount: number,
    soldDays: number
}) {
    try {
        // Validation logic
        const period = await prisma.vacationPeriod.findUnique({ where: { id: data.periodId }, include: { requests: true } });
        if (!period) return { success: false, error: 'Period not found' };

        // Calculate balance
        const usedDays = period.requests.reduce((acc, r) => acc + r.daysCount + r.soldDays, 0);
        const remaining = 30 - usedDays;
        const totalRequested = data.daysCount + data.soldDays;

        if (totalRequested > remaining) {
            return { success: false, error: `Saldo insuficiente. Restam ${remaining} dias.` };
        }

        const endDate = new Date(data.startDate);
        endDate.setDate(endDate.getDate() + data.daysCount - 1); // Inclusive

        await prisma.vacationRequest.create({
            data: {
                employeeId: data.employeeId,
                periodId: data.periodId,
                startDate: data.startDate,
                endDate: endDate,
                daysCount: data.daysCount,
                soldDays: data.soldDays,
                status: 'APPROVED' // Auto-approve for now
            }
        });

        revalidatePath('/dashboard/personnel');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create request' };
    }
}

export async function getAllVacations() {
    try {
        const requests = await prisma.vacationRequest.findMany({
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        photoUrl: true
                    }
                },
                period: true
            },
            orderBy: { startDate: 'desc' }
        });
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: 'Failed to fetch all vacations' };
    }
}

export async function getAllVacationPeriods() {
    try {
        // AUTO-SYNC: Update rights for all active employees before fetching
        // This ensures the dashboard is always up to date without manual buttons.
        await syncAllVacationRights();

        const periods = await prisma.vacationPeriod.findMany({

            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        photoUrl: true
                    }
                },
                requests: true
            },
            orderBy: { startDate: 'desc' },
            where: {
                status: { in: ['OPEN', 'ACCRUING', 'EXPIRED'] }
            }
        });
        return { success: true, data: periods };
    } catch (error) {
        return { success: false, error: 'Failed to fetch periods' };
    }
}


// Background Sync Function
async function syncAllVacationRights() {
    try {
        // Get all active employees
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });

        // Run checks in parallel
        await Promise.all(employees.map(emp => checkVacationRights(emp.id, false)));
    } catch (e) {
        // console.error("Auto-Sync Failed", e);
    }
}

