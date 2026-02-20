'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { addYears, addMonths, isBefore, differenceInDays } from 'date-fns';

import { parseSafeDate } from '@/shared/utils/date-utils';

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

        const admissionStr = emp.contract.admissionDate instanceof Date
            ? emp.contract.admissionDate.toISOString().split('T')[0]
            : (emp.contract.admissionDate as string).split('T')[0];

        const admission = parseSafeDate(admissionStr)!;
        const now = new Date();
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() + 1); // Allow if cursor matches today

        // Loop from admission year to now
        let cursor = new Date(admission);
        cursor.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const checkLimit = new Date(today);
        checkLimit.setFullYear(checkLimit.getFullYear() + 1); // Check periods up to 1 year ahead

        let safety = 0;

        while (isBefore(cursor, checkLimit) && safety < 50) {
            const nextAnniversary = addYears(cursor, 1);
            const periodEnd = new Date(nextAnniversary);
            periodEnd.setDate(periodEnd.getDate() - 1); // 1 year minus 1 day (e.g. 01/01 to 31/12)
            periodEnd.setHours(23, 59, 59, 999);

            // Check if period exists
            const exists = await prisma.vacationPeriod.findFirst({
                where: {
                    employeeId,
                    startDate: cursor
                }
            });

            if (!exists) {
                // Determine limits
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
            } else {
                // Update existing period status if needed
                const newStatus = isBefore(exists.limitDate, now) ? 'EXPIRED' : (isBefore(exists.endDate, now) ? 'OPEN' : 'ACCRUING');
                if (exists.status !== newStatus) {
                    await prisma.vacationPeriod.update({
                        where: { id: exists.id },
                        data: {
                            status: newStatus,
                            vested: isBefore(exists.endDate, now)
                        }
                    });
                }
            }

            cursor = nextAnniversary;
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

import { validateVacationRequest } from './utils/vacation-rules';

export async function createVacationRequest(data: {
    employeeId: string,
    periodId: string,
    startDate: Date,
    daysCount: number,
    soldDays: number
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Concurrency Protection: Re-read period data inside transaction
            const period = await tx.vacationPeriod.findUnique({
                where: { id: data.periodId },
                include: { requests: true }
            });

            if (!period) throw new Error('Período aquisitivo não encontrado.');

            // 2. CLT & Overlap Validations (Server-side)
            const validation = await validateVacationRequest(
                data.employeeId,
                data.startDate,
                data.daysCount,
                data.soldDays,
                period.requests
            );
            if (!validation.success) throw new Error(validation.error);

            // 3. Balance Validation inside transaction
            const usedDays = period.requests.reduce((acc, r) => acc + r.daysCount + r.soldDays, 0);
            const remaining = 30 - usedDays;
            const totalRequested = data.daysCount + data.soldDays;

            if (totalRequested > remaining) {
                throw new Error(`Saldo insuficiente. Restam ${remaining} dias.`);
            }

            // 4. Create the request
            const startDate = parseSafeDate(data.startDate)!;
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + data.daysCount - 1);

            const request = await tx.vacationRequest.create({
                data: {
                    employeeId: data.employeeId,
                    periodId: data.periodId,
                    startDate: startDate,
                    endDate: endDate,
                    daysCount: data.daysCount,
                    soldDays: data.soldDays,
                    status: 'APPROVED'
                }
            });

            // 5. Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    module: 'vacations',
                    resource: 'VacationRequest',
                    resourceId: request.id,
                    newData: JSON.stringify(request),
                }
            });

            return request;
        });

        revalidatePath('/dashboard/personnel');
        revalidatePath('/dashboard/vacations');
        return { success: true };
    } catch (error: any) {
        console.error('Vacation creation error:', error);
        return { success: false, error: error.message || 'Falha ao criar agendamento' };
    }
}

export async function deleteVacationRequest(requestId: string) {
    try {
        await prisma.$transaction(async (tx) => {
            const request = await tx.vacationRequest.findUnique({
                where: { id: requestId }
            });

            if (!request) throw new Error('Agendamento não encontrado.');

            // Audit Log (Before deletion to capture state)
            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    module: 'vacations',
                    resource: 'VacationRequest',
                    resourceId: requestId,
                    oldData: JSON.stringify(request),
                }
            });

            await tx.vacationRequest.delete({
                where: { id: requestId }
            });
        });

        revalidatePath('/dashboard/personnel');
        revalidatePath('/dashboard/vacations');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete vacation request:', error);
        return { success: false, error: error.message || 'Falha ao excluir agendamento' };
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

export async function getPendingVacationRequests() {
    try {
        const requests = await prisma.vacationRequest.findMany({
            where: { status: 'PENDING' },
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
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: requests };
    } catch (error) {
        return { success: false, error: 'Failed to fetch pending requests' };
    }
}

export async function updateVacationRequestStatus(requestId: string, status: string, notes?: string) {
    try {
        const request = await prisma.vacationRequest.update({
            where: { id: requestId },
            data: { status, notes }
        });

        // If approved, we might need to revalidate paths
        revalidatePath('/dashboard/vacations');
        return { success: true, data: request };
    } catch (error) {
        return { success: false, error: 'Failed to update request status' };
    }
}

export async function getEmployeeVacationSummary() {
    try {
        // Get all active employees and their vacation status
        // We focus on finding individuals with EXPIRED or OPEN periods.
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                department: true,
                photoUrl: true,
                vacationPeriods: {
                    include: { requests: true }
                }
            }
        });

        const summary = employees.map(emp => {
            const expiredCount = emp.vacationPeriods.filter(p => {
                const used = p.requests.reduce((rAcc, r) => rAcc + r.daysCount + r.soldDays, 0);
                return p.status === 'EXPIRED' && used < 30;
            }).length;
            const openCount = emp.vacationPeriods.filter(p => {
                const used = p.requests.reduce((rAcc, r) => rAcc + r.daysCount + r.soldDays, 0);
                return p.status === 'OPEN' && used < 30;
            }).length;

            // Calculate total balance
            const totalBalance = emp.vacationPeriods.reduce((acc, p) => {
                const used = p.requests.reduce((rAcc, r) => rAcc + r.daysCount + r.soldDays, 0);
                return acc + (p.status !== 'ACCRUING' ? (30 - used) : 0);
            }, 0);

            return {
                id: emp.id,
                name: emp.name,
                department: emp.department,
                photoUrl: emp.photoUrl,
                expiredCount,
                openCount,
                totalBalance,
                status: expiredCount > 0 ? 'EXPIRED' : openCount > 0 ? 'OPEN' : 'OK'
            };
        });

        return { success: true, data: summary };
    } catch (error) {
        console.error("Error fetching summary:", error);
        return { success: false, error: 'Failed to fetch vacation summary' };
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

