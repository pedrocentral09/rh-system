'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const StoreSchema = z.object({
    name: z.string().min(2, "Razão Social é obrigatória"),
    tradingName: z.string().optional(),
    code: z.string().optional(),
    cnpj: z.string().optional(),
    stateRegistration: z.string().optional(),
    municipalRegistration: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    responsible: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
});

export async function getStores() {
    try {
        const stores = await prisma.store.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { contracts: true } } }
        });
        return { success: true, data: stores };
    } catch (error) {
        console.error('Error fetching stores:', error);
        return { success: false, error: 'Falha ao buscar lojas' };
    }
}

export async function createStore(data: z.infer<typeof StoreSchema>) {
    try {
        const valid = StoreSchema.parse(data);

        await prisma.store.create({
            data: valid
        });

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error creating store:', error);
        return { success: false, error: 'Falha ao criar loja' };
    }
}

export async function updateStore(id: string, data: z.infer<typeof StoreSchema>) {
    try {
        const valid = StoreSchema.parse(data);

        await prisma.store.update({
            where: { id },
            data: valid
        });

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error updating store:', error);
        return { success: false, error: 'Falha ao atualizar loja' };
    }
}

export async function deleteStore(id: string) {
    try {
        const used = await prisma.contract.count({ where: { storeId: id } });
        if (used > 0) return { success: false, error: 'Loja possui funcionários vinculados.' };

        await prisma.store.delete({ where: { id } });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir' };
    }
}
