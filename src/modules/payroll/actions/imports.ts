
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Salva múltiplos itens de importação externa
 */
export async function saveExternalImports(periodId: string, data: {
    cpf: string;
    name?: string;
    itemCode: string; // 5006 ou 5007
    label: string;
    amount: number;
    sourceStore?: string;
}[]) {
    try {
        let successCount = 0;
        const errors: { cpf: string, name: string, amount: number, reason: string }[] = [];

        for (const item of data) {
            // 1. Localizar colaborador pelo CPF
            // Como o ERP pode não mandar zeros à esquerda ou pontuação, limpamos e reformatamos
            let cleanCpf = item.cpf.replace(/\D/g, '');
            if (cleanCpf.length > 0 && cleanCpf.length < 11) {
                cleanCpf = cleanCpf.padStart(11, '0');
            }
            const formattedCpf = cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

            const employee = await prisma.employee.findFirst({
                where: {
                    OR: [
                        { cpf: cleanCpf },
                        { cpf: formattedCpf }
                    ]
                }
            });

            if (!employee) {
                errors.push({
                    cpf: item.cpf,
                    name: item.name || 'NÃO IDENTIFICADO',
                    amount: item.amount,
                    reason: 'Funcionário não cadastrado'
                });
                continue;
            }

            const store = item.sourceStore || 'MATRIZ';

            // 2. Upsert do registro (um por colaborador/periodo/codigo/store)
            await prisma.$executeRawUnsafe(`
                INSERT INTO "payroll_external_imports" ("id", "employeeId", "periodId", "itemCode", "label", "amount", "sourceStore", "updatedAt")
                VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now())
                ON CONFLICT ("employeeId", "periodId", "itemCode", "sourceStore") 
                DO UPDATE SET "amount" = $5, "updatedAt" = now()
            `, employee.id, periodId, item.itemCode, item.label, item.amount, store);

            successCount++;
        }

        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true, successCount, errors };
    } catch (error) {
        console.error('[Import] Error saving:', error);
        return { success: false, error: 'Falha ao salvar importações.' };
    }
}

/**
 * Busca importações de um período
 */
export async function getExternalImportsByPeriod(periodId: string) {
    try {
        const imports: any[] = await prisma.$queryRawUnsafe(`
            SELECT i.*, e.name as "employeeName", e.cpf as "employeeCpf"
            FROM "payroll_external_imports" i
            INNER JOIN "personnel_employees" e ON i."employeeId" = e.id
            WHERE i."periodId" = $1
            ORDER BY i."sourceStore" ASC, e.name ASC, i."itemCode" ASC
        `, periodId);

        const serialized = imports.map(imp => ({
            ...imp,
            amount: Number(imp.amount)
        }));

        return { success: true, data: serialized };
    } catch (error) {
        console.error('[Import] Error fetching:', error);
        return { success: false, error: 'Falha ao buscar dados importados.' };
    }
}

/**
 * Remove uma importação específica
 */
export async function deleteExternalImport(id: string, periodId: string) {
    try {
        await prisma.$executeRawUnsafe(`DELETE FROM "payroll_external_imports" WHERE id = $1`, id);
        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir.' };
    }
}
