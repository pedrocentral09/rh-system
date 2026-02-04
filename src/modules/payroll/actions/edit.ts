
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to recalculate totals
async function recalculatePayslipTotals(payslipId: string) {
    const items = await prisma.payslipItem.findMany({
        where: { payslipId }
    });

    let totalAdditions = 0;
    let totalDeductions = 0;

    for (const item of items) {
        // We need to know if it's EARNING or DEDUCTION. 
        // We stored 'type' snapshot in PayslipItem, so use that.
        if (item.type === 'EARNING') {
            totalAdditions += Number(item.value);
        } else if (item.type === 'DEDUCTION') {
            totalDeductions += Number(item.value);
        }
    }

    const netSalary = totalAdditions - totalDeductions;

    await prisma.payslip.update({
        where: { id: payslipId },
        data: {
            grossSalary: totalAdditions, // Approximating Gross as Total Additions for now
            totalAdditions,
            totalDeductions,
            netSalary,
            status: 'CALCULATED' // Keep as calculated or change to 'MANUAL'? Let's keep CALCULATED to allow further edits.
        }
    });
}

export async function addPayslipItem(payslipId: string, eventCode: string, value: number, reference?: number) {
    try {
        const event = await prisma.payrollEvent.findUnique({ where: { code: eventCode } });
        if (!event) return { success: false, error: 'Evento não encontrado' };

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

        await recalculatePayslipTotals(payslipId);
        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Falha ao adicionar item' };
    }
}

export async function deletePayslipItem(itemId: string, payslipId: string) {
    try {
        await prisma.payslipItem.delete({ where: { id: itemId } });
        await recalculatePayslipTotals(payslipId);
        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Falha ao remover item' };
    }
}

export async function getPayrollEvents() {
    return await prisma.payrollEvent.findMany({
        orderBy: { code: 'asc' }
    });
}
