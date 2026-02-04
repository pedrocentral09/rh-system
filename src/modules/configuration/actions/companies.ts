'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CompanySchema = z.object({
    name: z.string().min(2, "Nome é obrigatório"),
    cnpj: z.string().min(14, "CNPJ inválido"),
    street: z.string().optional(),
    number: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
});

export async function getCompanies() {
    try {
        const companies = await prisma.company.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { contracts: true } } }
        });
        return { success: true, data: companies };
    } catch (error) {
        console.error('Error fetching companies:', error);
        return { success: false, error: 'Falha ao buscar empresas' };
    }
}

export async function createCompany(data: z.infer<typeof CompanySchema>) {
    try {
        const valid = CompanySchema.parse(data);

        await prisma.company.create({
            data: valid
        });

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error creating company:', error);
        return { success: false, error: 'Falha ao criar empresa' };
    }
}

export async function deleteCompany(id: string) {
    try {
        // Check if used
        const used = await prisma.contract.count({ where: { companyId: id } });
        if (used > 0) return { success: false, error: 'Empresa possui contratos vinculados.' };

        await prisma.company.delete({ where: { id } });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir' };
    }
}
