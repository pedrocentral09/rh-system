'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface TransferData {
    employeeId: string;
    date: Date;
    newStore: string;
    reason: string;
    notes?: string;
}

export async function registerTransfer(data: TransferData) {
    try {
        const { employeeId, date, newStore, reason, notes } = data;

        // 1. Get current contract to find previous store
        const contract = await prisma.contract.findUnique({
            where: { employeeId },
            select: {
                store: {
                    select: { name: true }
                }
            }
        });

        if (!contract) {
            return { success: false, error: 'Funcionário sem contrato ativo.' };
        }

        const previousStore = (contract.store && contract.store.name) ? contract.store.name : 'Não Informado';

        if (previousStore === newStore) {
            return { success: false, error: 'A nova loja deve ser diferente da atual.' };
        }

        // Find new store ID
        const targetStore = await prisma.store.findFirst({
            where: { name: newStore }
        });

        if (!targetStore) {
            return { success: false, error: 'Loja de destino não encontrada.' };
        }

        // 2. Transaction: Update Store + Create History
        await prisma.$transaction([
            // Update Contract
            prisma.contract.update({
                where: { employeeId },
                data: {
                    storeId: targetStore.id
                }
            }),
            // Create History
            prisma.transferHistory.create({
                data: {
                    employeeId,
                    date,
                    previousStore,
                    newStore,
                    reason,
                    notes
                }
            })
        ]);

        revalidatePath('/dashboard/personnel');
        return { success: true };
    } catch (error) {
        console.error('Error registering transfer:', error);
        return { success: false, error: 'Falha ao registrar transferência.' };
    }
}

export async function getTransferHistory(employeeId: string) {
    try {
        const history = await prisma.transferHistory.findMany({
            where: { employeeId },
            orderBy: { date: 'desc' }
        });
        return { success: true, data: history };
    } catch (error) {
        return { success: false, error: 'Failed to fetch history' };
    }
}
