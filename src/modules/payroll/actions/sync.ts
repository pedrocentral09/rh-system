
'use server';

import { prisma } from '@/lib/prisma';
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';
import { revalidatePath } from 'next/cache';

// Constants for Event Codes (Must match Seed)
const EVENT_OVERTIME_50 = '1002'; // Need to ensure this exists in Seed
const EVENT_ABSENCE = '5002'; // Need to ensure this exists in Seed

export async function syncTimeSheetToPayroll(periodId: string) {
    try {
        // 1. Fetch Period
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { payslips: { include: { employee: { include: { contract: true } } } } }
        });

        if (!period) return { success: false, error: 'Competência não encontrada' };
        if (period.status === 'CLOSED') return { success: false, error: 'Competência fechada.' };

        // 2. Fetch Events (Rubricas) to get IDs
        const evtOvertime = await prisma.payrollEvent.findUnique({ where: { code: EVENT_OVERTIME_50 } });
        const evtAbsence = await prisma.payrollEvent.findUnique({ where: { code: EVENT_ABSENCE } });

        if (!evtOvertime || !evtAbsence) {
            return { success: false, error: 'Rubricas de Hora Extra (1002) ou Faltas (5002) não encontradas.' };
        }

        let processedCount = 0;

        // 3. Loop Payslips
        for (const payslip of period.payslips) {
            // A. Fetch Time Sheet
            const tsResult = await getTimeSheet(payslip.employeeId, period.month, period.year);
            if (!tsResult.success || !tsResult.data) continue;

            const { totalBalance } = tsResult.data;

            if (totalBalance === 0) continue; // No difference

            // B. Calculate Hourly Rate
            // Default 220h divisor for CLT FULL_TIME
            const baseSalary = Number(payslip.employee.contract?.baseSalary || 0);
            const hourlyRate = baseSalary / 220;

            // C. Determine Insert/Update logic
            if (totalBalance > 0) {
                // Credit: Overtime 50%
                const hours = totalBalance / 60;
                const value = hours * hourlyRate * 1.5; // 50%

                // Upsert Item
                await upsertPayslipItem(payslip.id, evtOvertime, value, Number(hours.toFixed(2)));
                // Remove potential old Absence if user fixed time
                await removePayslipItem(payslip.id, evtAbsence.id);

            } else {
                // Debit: Absence/Delay
                const hours = Math.abs(totalBalance) / 60;
                const value = hours * hourlyRate; // 100% deduction usually? Or scale? Default 1:1 deduction

                // Upsert Item
                await upsertPayslipItem(payslip.id, evtAbsence, value, Number(hours.toFixed(2)));
                // Remove potential old Overtime
                await removePayslipItem(payslip.id, evtOvertime.id);
            }

            // D. Recalculate Totals (Reuse logic or minimal update)
            await recalculateTotals(payslip.id);
            processedCount++;
        }

        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true, message: `${processedCount} holerites atualizados com o ponto.` };

    } catch (error) {
        console.error('Sync Error:', error);
        return { success: false, error: 'Falha na sincronização.' };
    }
}

// Helpers
async function upsertPayslipItem(payslipId: string, event: any, value: number, reference: number) {
    // Check if exists
    const existing = await prisma.payslipItem.findFirst({
        where: { payslipId, eventId: event.id }
    });

    if (existing) {
        await prisma.payslipItem.update({
            where: { id: existing.id },
            data: { value, reference }
        });
    } else {
        await prisma.payslipItem.create({
            data: {
                payslipId,
                eventId: event.id,
                name: event.name,
                type: event.type,
                value,
                reference
            }
        });
    }
}

async function removePayslipItem(payslipId: string, eventId: string) {
    await prisma.payslipItem.deleteMany({
        where: { payslipId, eventId }
    });
}

async function recalculateTotals(payslipId: string) {
    const items = await prisma.payslipItem.findMany({ where: { payslipId } });
    let add = 0, sub = 0;

    items.forEach(i => {
        if (i.type === 'EARNING') add += Number(i.value);
        if (i.type === 'DEDUCTION') sub += Number(i.value);
    });

    await prisma.payslip.update({
        where: { id: payslipId },
        data: {
            totalAdditions: add,
            totalDeductions: sub,
            netSalary: add - sub
        }
    });
}
