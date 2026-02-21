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
    erpId: z.string().optional(),
});

export async function getStores() {
    try {
        const rawStores: any[] = await prisma.$queryRaw`
            SELECT 
                s.*,
                (SELECT COUNT(*) FROM "personnel_contracts" c WHERE c."storeId" = s.id) as count_contracts
            FROM "core_stores" s
            ORDER BY s."name" ASC
        `;

        const stores = rawStores.map(s => ({
            ...s,
            _count: {
                contracts: Number(s.count_contracts)
            }
        }));
        return { success: true, data: stores };
    } catch (error) {
        console.error('Error fetching stores:', error);
        return { success: false, error: 'Falha ao buscar lojas' };
    }
}

export async function createStore(data: z.infer<typeof StoreSchema>) {
    try {
        const valid = StoreSchema.parse(data);

        const id = require('crypto').randomUUID();
        await prisma.$executeRaw`
            INSERT INTO "core_stores" (
                "id", "name", "tradingName", "code", "cnpj", "stateRegistration", 
                "municipalRegistration", "phone", "email", "responsible", "street", 
                "number", "complement", "neighborhood", "city", "state", "zipCode", "erpId", "updatedAt"
            ) VALUES (
                ${id}, ${valid.name}, ${valid.tradingName || null}, ${valid.code || null}, ${valid.cnpj || null}, 
                ${valid.stateRegistration || null}, ${valid.municipalRegistration || null}, ${valid.phone || null}, 
                ${valid.email || null}, ${valid.responsible || null}, ${valid.street || null}, ${valid.number || null}, 
                ${valid.complement || null}, ${valid.neighborhood || null}, ${valid.city || null}, ${valid.state || null}, 
                ${valid.zipCode || null}, ${valid.erpId || null}, now()
            )
        `;

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

        await prisma.$executeRaw`
            UPDATE "core_stores"
            SET "name" = ${valid.name},
                "tradingName" = ${valid.tradingName || null},
                "code" = ${valid.code || null},
                "cnpj" = ${valid.cnpj || null},
                "stateRegistration" = ${valid.stateRegistration || null},
                "municipalRegistration" = ${valid.municipalRegistration || null},
                "phone" = ${valid.phone || null},
                "email" = ${valid.email || null},
                "responsible" = ${valid.responsible || null},
                "street" = ${valid.street || null},
                "number" = ${valid.number || null},
                "complement" = ${valid.complement || null},
                "neighborhood" = ${valid.neighborhood || null},
                "city" = ${valid.city || null},
                "state" = ${valid.state || null},
                "zipCode" = ${valid.zipCode || null},
                "erpId" = ${valid.erpId || null},
                "updatedAt" = now()
            WHERE "id" = ${id}
        `;

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
