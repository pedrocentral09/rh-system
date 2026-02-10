'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// JobRole Actions
export async function getJobRoles() {
    try {
        const roles = await prisma.jobRole.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { employees: true, contracts: true } } }
        });
        return { success: true, data: roles };
    } catch (error) {
        return { success: false, error: 'Falha ao buscar cargos' };
    }
}

export async function createJobRole(data: { name: string; cbo?: string; description?: string }) {
    try {
        await prisma.jobRole.create({ data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Este cargo já existe.' };
        return { success: false, error: 'Erro ao criar cargo' };
    }
}

export async function updateJobRole(id: string, data: { name: string; cbo?: string; description?: string }) {
    try {
        await prisma.jobRole.update({ where: { id }, data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar cargo' };
    }
}

export async function deleteJobRole(id: string) {
    try {
        const linked = await prisma.employee.count({ where: { jobRoleId: id } });
        if (linked > 0) return { success: false, error: 'Não é possível excluir: cargo vinculado a funcionários.' };

        await prisma.jobRole.delete({ where: { id } });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir cargo' };
    }
}

// Sector Actions
export async function getSectors() {
    try {
        const sectors = await prisma.sector.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { contracts: true } } }
        });
        return { success: true, data: sectors };
    } catch (error) {
        return { success: false, error: 'Falha ao buscar setores' };
    }
}

export async function createSector(data: { name: string }) {
    try {
        await prisma.sector.create({ data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Este setor já existe.' };
        return { success: false, error: 'Erro ao criar setor' };
    }
}

export async function updateSector(id: string, data: { name: string }) {
    try {
        await prisma.sector.update({ where: { id }, data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar setor' };
    }
}

export async function deleteSector(id: string) {
    try {
        const linked = await prisma.contract.count({ where: { sectorId: id } });
        if (linked > 0) return { success: false, error: 'Não é possível excluir: setor vinculado a contratos.' };

        await prisma.sector.delete({ where: { id } });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir setor' };
    }
}

// TerminationReason Actions
export async function getTerminationReasons() {
    try {
        const reasons = await prisma.terminationReason.findMany({
            orderBy: { name: 'asc' },
            include: { _count: { select: { contracts: true } } }
        });
        return { success: true, data: reasons };
    } catch (error) {
        return { success: false, error: 'Falha ao buscar motivos' };
    }
}

export async function createTerminationReason(data: { name: string }) {
    try {
        await prisma.terminationReason.create({ data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') return { success: false, error: 'Este motivo já existe.' };
        return { success: false, error: 'Erro ao criar motivo' };
    }
}

export async function updateTerminationReason(id: string, data: { name: string }) {
    try {
        await prisma.terminationReason.update({ where: { id }, data });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao atualizar motivo' };
    }
}

export async function deleteTerminationReason(id: string) {
    try {
        const linked = await prisma.contract.count({ where: { terminationReasonId: id } });
        if (linked > 0) return { success: false, error: 'Não é possível excluir: motivo em uso em contratos finalizados.' };

        await prisma.terminationReason.delete({ where: { id } });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Erro ao excluir motivo' };
    }
}
