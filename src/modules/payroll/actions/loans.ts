
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Cria um novo empréstimo e gera suas parcelas
 */
export async function createLoan(data: {
    employeeId: string;
    totalAmount: number;
    installmentsCount: number;
    reason?: string;
    startDate: Date; // A primeira parcela cai neste mês
}) {
    try {
        const amountPerInstallment = Number((data.totalAmount / data.installmentsCount).toFixed(2));
        const start = new Date(data.startDate);

        // 1. Criar o empréstimo
        const loanId = (await prisma.$queryRawUnsafe<{ id: string }[]>(`
            INSERT INTO "payroll_loans" ("id", "employeeId", "totalAmount", "installmentsCount", "reason", "status", "startDate", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', $5, now())
            RETURNING id
        `, data.employeeId, data.totalAmount, data.installmentsCount, data.reason || '', start))[0].id;

        // 2. Gerar Parcelas
        let currentMonth = start.getMonth() + 1; // getMonth() é 0-indexed
        let currentYear = start.getFullYear();

        for (let i = 1; i <= data.installmentsCount; i++) {
            // Garantir que a competência (PayrollPeriod) exista
            let periodId: string;
            const existingPeriod = await prisma.payrollPeriod.findUnique({
                where: { month_year: { month: currentMonth, year: currentYear } }
            });

            if (existingPeriod) {
                periodId = existingPeriod.id;
            } else {
                // Criar competência se não existir
                const newPeriod = await prisma.payrollPeriod.create({
                    data: { month: currentMonth, year: currentYear, status: 'OPEN' }
                });
                periodId = newPeriod.id;
            }

            // Criar a parcela
            await prisma.$executeRawUnsafe(`
                INSERT INTO "payroll_loan_installments" ("id", "loanId", "periodId", "installmentNumber", "amount", "status", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', now())
            `, loanId, periodId, i, amountPerInstallment);

            // Próximo mês
            currentMonth++;
            if (currentMonth > 12) {
                currentMonth = 1;
                currentYear++;
            }
        }

        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error: any) {
        console.error('[Loan] Error creating:', error);
        return { success: false, error: 'Falha ao contratar empréstimo.' };
    }
}

/**
 * Busca todas as parcelas de um período
 */
export async function getLoanInstallmentsByPeriod(periodId: string) {
    try {
        const installments: any[] = await prisma.$queryRawUnsafe(`
            SELECT i.*, e.name as "employeeName", l.reason, l."totalAmount", l."installmentsCount"
            FROM "payroll_loan_installments" i
            INNER JOIN "payroll_loans" l ON i."loanId" = l.id
            INNER JOIN "personnel_employees" e ON l."employeeId" = e.id
            WHERE i."periodId" = $1
            ORDER BY e.name ASC
        `, periodId);

        // Serialização (Decimal to Number)
        const serialized = installments.map(inst => ({
            ...inst,
            amount: Number(inst.amount),
            totalAmount: Number(inst.totalAmount)
        }));

        return { success: true, data: serialized };
    } catch (error) {
        console.error('[Loan] Error fetching installments:', error);
        return { success: false, error: 'Falha ao buscar parcelas.' };
    }
}

/**
 * Atualiza status da parcela
 */
export async function updateInstallmentStatus(id: string, status: string, periodId: string) {
    try {
        await prisma.$executeRawUnsafe(`
            UPDATE "payroll_loan_installments" SET status = $1, "updatedAt" = now() WHERE id = $2
        `, status, id);
        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar.' };
    }
}

/**
 * Exclui o empréstimo todo (e suas parcelas por cascata no DB se configurado, ou manual)
 */
export async function deleteLoan(loanId: string, periodId: string) {
    try {
        // A relação no prisma tem onDelete: Cascade, então deve funcionar no DB se as constraints estiverem certas.
        // Se não, deletamos manual.
        await prisma.$executeRawUnsafe(`DELETE FROM "payroll_loans" WHERE id = $1`, loanId);
        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir empréstimo.' };
    }
}
