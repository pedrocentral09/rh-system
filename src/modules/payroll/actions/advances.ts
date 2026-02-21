
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Cria um novo adiantamento para um colaborador
 */
export async function createSalaryAdvance(data: {
    employeeId: string;
    periodId: string;
    amount: number;
    description?: string;
}) {
    try {
        const advance = await prisma.$executeRawUnsafe(`
            INSERT INTO "payroll_salary_advances" ("id", "employeeId", "periodId", "amount", "description", "status", "updatedAt")
            VALUES (gen_random_uuid(), $1, $2, $3, $4, 'PENDING', now())
            ON CONFLICT ("employeeId", "periodId") DO UPDATE SET
                "amount" = $3,
                "description" = $4,
                "updatedAt" = now()
            RETURNING *
        `, data.employeeId, data.periodId, data.amount, data.description || '');

        revalidatePath(`/dashboard/payroll/${data.periodId}`);
        return { success: true };
    } catch (error: any) {
        console.error('[Advance] Error creating:', error);
        return { success: false, error: 'Falha ao registrar adiantamento.' };
    }
}

/**
 * Busca todos os adiantamentos de um período
 */
export async function getAdvancesByPeriod(periodId: string) {
    try {
        // Como o types do prisma pode estar desatualizado por EPERM, usamos queryRaw
        const advances: any[] = await prisma.$queryRawUnsafe(`
            SELECT a.*, e.name as "employeeName"
            FROM "payroll_salary_advances" a
            INNER JOIN "personnel_employees" e ON a."employeeId" = e.id
            WHERE a."periodId" = $1
            ORDER BY e.name ASC
        `, periodId);

        // Converter Decimal para Number para serialização entre Server/Client Components
        const serialized = advances.map(adv => ({
            ...adv,
            amount: Number(adv.amount)
        }));

        return { success: true, data: serialized };
    } catch (error) {
        console.error('[Advance] Error fetching:', error);
        return { success: false, error: 'Falha ao buscar adiantamentos.' };
    }
}

/**
 * Atualiza o status de um adiantamento (PAGAR / CANCELAR)
 */
export async function updateAdvanceStatus(id: string, status: 'PAID' | 'CANCELLED' | 'PENDING', periodId: string) {
    try {
        await prisma.$executeRawUnsafe(`
            UPDATE "payroll_salary_advances"
            SET "status" = $1, "paymentDate" = $2, "updatedAt" = now()
            WHERE id = $3
        `, status, status === 'PAID' ? new Date() : null, id);

        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };
    } catch (error) {
        console.error('[Advance] Error updating status:', error);
        return { success: false, error: 'Falha ao atualizar status.' };
    }
}

/**
 * Remove um adiantamento
 */
export async function deleteAdvance(id: string, periodId: string) {
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM "payroll_salary_advances" WHERE id = $1`, id);
        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };
    } catch (error) {
        console.error('[Advance] Error deleting:', error);
        return { success: false, error: 'Falha ao excluir adiantamento.' };
    }
}
