'use server';

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/modules/core/actions/auth";
import { revalidatePath } from "next/cache";

export async function sendCoinsToColleague(targetEmployeeId: string, amount: number, message: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const sender = await prisma.employee.findUnique({
            where: { userId: user.id },
            include: { coinTransactions: true }
        });
        if (!sender) return { success: false, error: 'Sender not found' };

        // Calculate balance
        const balance = sender.coinTransactions.reduce((acc, t) => acc + t.amount, 0);

        if (balance < amount) {
            return { success: false, error: 'Saldo insuficiente' };
        }

        if (amount <= 0) {
            return { success: false, error: 'Valor inválido' };
        }

        const receiver = await prisma.employee.findUnique({ where: { id: targetEmployeeId } });
        if (!receiver) return { success: false, error: 'Receiver not found' };

        // Execute transactions in a batch
        await prisma.$transaction([
            // Deduct from sender
            prisma.coinTransaction.create({
                data: {
                    employeeId: sender.id,
                    amount: -amount,
                    type: 'P2P_SENT',
                    description: `Reconhecimento enviado para ${receiver.name}: "${message}"`,
                }
            }),
            // Add to receiver
            prisma.coinTransaction.create({
                data: {
                    employeeId: receiver.id,
                    amount: amount,
                    type: 'P2P_RECEIVED',
                    description: `Reconhecimento recebido de ${sender.name}: "${message}"`,
                }
            })
        ]);

        revalidatePath('/portal/rewards');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getColleaguesList() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const currentEmployee = await prisma.employee.findUnique({ where: { userId: user.id } });

        const colleagues = await prisma.employee.findMany({
            where: {
                status: 'ACTIVE',
                id: { not: currentEmployee?.id }
            },
            select: {
                id: true,
                name: true,
                photoUrl: true,
                jobRole: { select: { name: true } }
            },
            orderBy: { name: 'asc' }
        });

        return { success: true, data: colleagues };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
