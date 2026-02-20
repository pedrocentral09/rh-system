'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

interface TransferData {
    employeeId: string;
    date: Date;
    newStoreId: string;
    reason: string;
    notes?: string;
}

export async function registerTransfer(data: TransferData) {
    try {
        const { employeeId, date, newStoreId, reason, notes } = data;

        // 1. Get current contract to find previous store name and current store ID
        const contract = await prisma.contract.findUnique({
            where: { employeeId },
            include: {
                store: true
            }
        });

        if (!contract) {
            return { success: false, error: 'Funcionário sem contrato ativo.' };
        }

        const previousStore = contract.store?.name || 'Não Informado';

        // Find new store to get its name for history
        const targetStore = await prisma.store.findUnique({
            where: { id: newStoreId }
        });

        if (!targetStore) {
            return { success: false, error: 'Loja de destino não encontrada.' };
        }

        if (contract.storeId === newStoreId) {
            return { success: false, error: 'A nova loja deve ser diferente da atual.' };
        }

        // 2. Transaction: Update Store ID in Contract + Create Transfer History
        await prisma.$transaction([
            // Update Contract
            prisma.contract.update({
                where: { employeeId },
                data: {
                    storeId: newStoreId
                }
            }),
            // Create History
            prisma.transferHistory.create({
                data: {
                    employeeId,
                    date,
                    previousStore,
                    newStore: targetStore.name,
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
