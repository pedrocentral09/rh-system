
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { PayrollEngine } from '../services/PayrollEngine';

// Calculate Single Employee Payslip
export async function calculatePayslip(employeeId: string, periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        if (!period || period.status === 'CLOSED') {
            return { success: false, error: 'Período encerrado ou inválido.' };
        }

        // 1. Orquestrar cálculos via PayrollEngine
        const calc = await PayrollEngine.calculatePayslip(employeeId, periodId, true);
        if (!calc.success || !calc.items || !calc.totals) {
            return { success: false, error: calc.error || 'Falha no cálculo.' };
        }

        // 2. Mapear Rubricas (Eventos) para obter os IDs
        const eventCodes = calc.items.map((i: any) => i.code);
        const events = await prisma.payrollEvent.findMany({
            where: { code: { in: eventCodes } }
        });
        const eventMap = new Map(events.map(e => [e.code, e]));

        // 3. Persistir no Banco de Dados via Transação
        await prisma.$transaction(async (tx) => {
            // Upsert do cabeçalho do Holerite
            const payslip = await tx.payslip.upsert({
                where: {
                    periodId_employeeId: {
                        periodId,
                        employeeId
                    }
                },
                update: {
                    grossSalary: calc.totals!.gross,
                    netSalary: calc.totals!.net,
                    totalAdditions: calc.totals!.additions,
                    totalDeductions: calc.totals!.deductions,
                    status: 'CALCULATED',
                    updatedAt: new Date()
                },
                create: {
                    periodId,
                    employeeId,
                    grossSalary: calc.totals!.gross,
                    netSalary: calc.totals!.net,
                    totalAdditions: calc.totals!.additions,
                    totalDeductions: calc.totals!.deductions,
                    status: 'CALCULATED'
                }
            });

            // Limpar itens antigos que NÃO foram lançados manualmente (somente AUTO e SYNC)
            // Para um refactory radical, vamos limpar tudo e os itens manuais terão que ser relançados
            // mas o ideal é preservar MANUAL futuramente. Por enquanto, limpamos tudo conforme o plano.
            await tx.payslipItem.deleteMany({
                where: { payslipId: payslip.id }
            });

            // Inserir novos itens calculados
            console.log(`[Payroll] Persistindo ${calc.items!.length} itens para ${employeeId}`);
            let createdCount = 0;
            for (const item of calc.items!) {
                const event = eventMap.get(item.code);
                if (event) {
                    await tx.payslipItem.create({
                        data: {
                            payslipId: payslip.id,
                            eventId: event.id,
                            name: event.name,
                            type: event.type,
                            value: item.value,
                            reference: item.reference,
                            // source: item.source || 'AUTO' // Removido para evitar erro de lint/prisma generate
                        }
                    });
                    createdCount++;
                } else {
                    console.warn(`[Payroll] Evento não encontrado para código: ${item.code}`);
                }
            }
            console.log(`[Payroll] Sucesso: ${createdCount} itens salvos.`);
        });

        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };

    } catch (error: any) {
        console.error("Calculation Error:", error);
        return { success: false, error: error.message || 'Falha no cálculo' };
    }
}

// Bulk Process for Period
export async function calculateAllPayslips(periodId: string) {
    try {
        console.log(`[Payroll] Starting Bulk Calculation for Period: ${periodId}`);

        // Fetch all active employees
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, contract: true }
        });

        console.log(`[Payroll] Found ${employees.length} ACTIVE employees.`);

        let successCount = 0;
        let failCount = 0;

        for (const emp of employees) {
            if (!emp.contract) {
                failCount++;
                continue;
            }

            const res = await calculatePayslip(emp.id, periodId);
            if (res.success) {
                successCount++;
            } else {
                console.error(`[Payroll] Failed to calculate ${emp.name}:`, res.error);
                failCount++;
            }
        }

        console.log(`[Payroll] Finished. Success: ${successCount}, Failed: ${failCount}`);

        revalidatePath('/dashboard/payroll');
        // Force revalidate the specific period page too
        revalidatePath(`/dashboard/payroll/${periodId}`);

        return { success: true, processed: successCount, failed: failCount };

    } catch (error) {
        console.error('[Payroll] Bulk Process Fatal Error:', error);
        return { success: false, error: 'Bulk Process Failed' };
    }
}
