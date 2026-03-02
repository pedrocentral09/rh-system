'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from '@/modules/core/actions/auth';

// ==========================================
// LEDGER & BALANCE
// ==========================================

export async function getEmployeeCoinBalance(employeeId?: string) {
    try {
        let targetEmployeeId = employeeId;

        if (!targetEmployeeId) {
            const user = await getCurrentUser();
            if (!user) return { success: false, error: 'Não autorizado' };
            const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
            if (!employee) return { success: false, error: 'Colaborador não encontrado' };
            targetEmployeeId = employee.id;
        }

        const transactions = await prisma.coinTransaction.findMany({
            where: { employeeId: targetEmployeeId },
            orderBy: { createdAt: 'desc' },
        });

        const balance = transactions.reduce((acc, curr) => acc + curr.amount, 0);

        return { success: true, data: { balance, transactions } };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function grantCoins(data: { employeeId: string; amount: number; description: string; source?: string }) {
    try {
        const user = await getCurrentUser();
        // Here we could check if user is admin, but middleware handles it mostly

        const transaction = await prisma.coinTransaction.create({
            data: {
                employeeId: data.employeeId,
                amount: Math.abs(data.amount), // Ensure positive
                type: 'EARNED',
                source: data.source || 'MANAGER',
                description: data.description,
            }
        });

        revalidatePath('/dashboard/rewards/distribute');
        return { success: true, data: transaction };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// CATALOG
// ==========================================

export async function getRewardCatalog(includeInactive = false) {
    try {
        const catalog = await prisma.rewardCatalog.findMany({
            where: includeInactive ? {} : { isActive: true },
            orderBy: { cost: 'asc' },
        });
        return { success: true, data: catalog };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createRewardItem(data: { title: string; description?: string; cost: number; stock?: number; imageUrl?: string }) {
    try {
        const item = await prisma.rewardCatalog.create({
            data: {
                title: data.title,
                description: data.description,
                cost: data.cost,
                stock: data.stock,
                imageUrl: data.imageUrl,
            }
        });
        revalidatePath('/dashboard/rewards/catalog');
        return { success: true, data: item };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleRewardStatus(id: string, isActive: boolean) {
    try {
        await prisma.rewardCatalog.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/dashboard/rewards/catalog');
        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteRewardItem(id: string) {
    try {
        await prisma.rewardCatalog.delete({ where: { id } });
        revalidatePath('/dashboard/rewards/catalog');
        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// REDEMPTIONS
// ==========================================

export async function requestRedemption(rewardId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee) return { success: false, error: 'Colaborador não encontrado' };

        // 1. Get Reward details
        const reward = await prisma.rewardCatalog.findUnique({ where: { id: rewardId } });
        if (!reward || !reward.isActive) return { success: false, error: 'Recompensa indisponível' };
        if (reward.stock !== null && reward.stock <= 0) return { success: false, error: 'Estoque esgotado' };

        // 2. Check Balance
        const { data: balanceData } = await getEmployeeCoinBalance(employee.id);
        const currentBalance = balanceData?.balance || 0;

        if (currentBalance < reward.cost) {
            return { success: false, error: 'Saldo insuficiente' };
        }

        // 3. Create Request and Debit transaction (in transaction)
        const result = await prisma.$transaction(async (tx) => {
            const request = await tx.redemptionRequest.create({
                data: {
                    employeeId: employee.id,
                    rewardId: reward.id,
                    costAtTime: reward.cost,
                    status: 'PENDING'
                }
            });

            await tx.coinTransaction.create({
                data: {
                    employeeId: employee.id,
                    amount: -reward.cost, // Negative amount for spending
                    type: 'SPENT',
                    source: 'SYSTEM',
                    description: `Resgate pendente: ${reward.title}`
                }
            });

            // Decrease stock if applicable
            if (reward.stock !== null) {
                await tx.rewardCatalog.update({
                    where: { id: reward.id },
                    data: { stock: { decrement: 1 } }
                });
            }

            return request;
        });

        revalidatePath('/portal/rewards');
        return { success: true, data: result };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllRedemptions() {
    try {
        const redemptions = await prisma.redemptionRequest.findMany({
            include: {
                employee: { select: { id: true, name: true, jobRole: { select: { name: true } } } },
                reward: { select: { title: true, imageUrl: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: redemptions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateRedemptionStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'DELIVERED') {
    try {
        const request = await prisma.redemptionRequest.findUnique({
            where: { id },
            include: { reward: true }
        });

        if (!request) return { success: false, error: 'Pedido não encontrado' };

        await prisma.$transaction(async (tx) => {
            // Update request status
            await tx.redemptionRequest.update({
                where: { id },
                data: { status }
            });

            // If REJECTED, refund the coins and return stock
            if (status === 'REJECTED' && request.status === 'PENDING') {
                await tx.coinTransaction.create({
                    data: {
                        employeeId: request.employeeId,
                        amount: request.costAtTime, // Refund positive
                        type: 'ADJUSTMENT',
                        source: 'SYSTEM',
                        description: `Estorno de resgate rejeitado: ${request.reward.title}`
                    }
                });

                if (request.reward.stock !== null) {
                    await tx.rewardCatalog.update({
                        where: { id: request.rewardId },
                        data: { stock: { increment: 1 } }
                    });
                }
            }
        });

        revalidatePath('/dashboard/rewards/requests');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// MISSIONS (REWARD TASKS)
// ==========================================

export async function getActiveMissions() {
    try {
        const missions = await prisma.rewardTask.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: missions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getAllMissions() {
    try {
        const missions = await prisma.rewardTask.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { completions: true }
                }
            }
        });
        return { success: true, data: missions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function createMission(data: { title: string; description?: string; rewardAmount: number }) {
    try {
        const mission = await prisma.rewardTask.create({
            data: {
                title: data.title,
                description: data.description,
                rewardAmount: data.rewardAmount,
            }
        });
        revalidatePath('/dashboard/rewards/missions');
        revalidatePath('/portal/rewards');
        return { success: true, data: mission };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleMissionStatus(id: string, isActive: boolean) {
    try {
        await prisma.rewardTask.update({
            where: { id },
            data: { isActive },
        });
        revalidatePath('/dashboard/rewards/missions');
        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteMission(id: string) {
    try {
        await prisma.rewardTask.delete({ where: { id } });
        revalidatePath('/dashboard/rewards/missions');
        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// ==========================================
// MISSION COMPLETIONS
// ==========================================

export async function submitMissionCompletion(taskId: string, proofText: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autorizado' };

        const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
        if (!employee) return { success: false, error: 'Colaborador não encontrado' };

        // Check if already submitted and pending/approved
        const existing = await prisma.taskCompletionRequest.findFirst({
            where: {
                employeeId: employee.id,
                taskId,
                status: { in: ['PENDING', 'APPROVED'] }
            }
        });

        if (existing) {
            return { success: false, error: 'Você já enviou esta missão ou ela já foi aprovada.' };
        }

        const completion = await prisma.taskCompletionRequest.create({
            data: {
                employeeId: employee.id,
                taskId,
                proofText,
                status: 'PENDING'
            }
        });

        revalidatePath('/portal/rewards');
        return { success: true, data: completion };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getPendingMissionCompletions() {
    try {
        const completions = await prisma.taskCompletionRequest.findMany({
            where: { status: 'PENDING' },
            include: {
                employee: { select: { id: true, name: true, jobRole: { select: { name: true } } } },
                task: { select: { title: true, rewardAmount: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { success: true, data: completions };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reviewMissionCompletion(completionId: string, status: 'APPROVED' | 'REJECTED') {
    try {
        const completion = await prisma.taskCompletionRequest.findUnique({
            where: { id: completionId },
            include: { task: true }
        });

        if (!completion) return { success: false, error: 'Envio não encontrado' };
        if (completion.status !== 'PENDING') return { success: false, error: 'Envio já foi avaliado' };

        await prisma.$transaction(async (tx) => {
            // Update completion status
            await tx.taskCompletionRequest.update({
                where: { id: completionId },
                data: { status }
            });

            // If APPROVED, reward the employee
            if (status === 'APPROVED') {
                await tx.coinTransaction.create({
                    data: {
                        employeeId: completion.employeeId,
                        amount: completion.task.rewardAmount,
                        type: 'EARNED',
                        source: 'SYSTEM',
                        description: `Missão concluída: ${completion.task.title}`
                    }
                });
            }
        });

        revalidatePath('/dashboard/rewards/requests');
        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

