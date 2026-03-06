'use server';

import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/modules/core/actions/auth';
import { revalidatePath } from 'next/cache';

export async function getSupportTickets() {
    const user = await requireAuth();

    if (user.role === 'EMPLOYEE') {
        const employee = await prisma.employee.findUnique({
            where: { userId: user.id },
            select: { id: true }
        });

        if (!employee) return { success: false, error: 'Colaborador não encontrado' };

        const tickets = await prisma.supportTicket.findMany({
            where: { employeeId: employee.id },
            include: {
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, data: tickets };
    } else {
        // Admin/HR see all
        const tickets = await prisma.supportTicket.findMany({
            include: {
                employee: { select: { name: true, photoUrl: true } },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return { success: true, data: tickets };
    }
}

export async function createSupportTicket(subject: string, initialMessage: string) {
    const user = await requireAuth(['EMPLOYEE']);

    const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true }
    });

    if (!employee) return { success: false, error: 'Colaborador não encontrado' };

    try {
        const ticket = await prisma.supportTicket.create({
            data: {
                employeeId: employee.id,
                subject,
                messages: {
                    create: {
                        senderId: user.id,
                        content: initialMessage
                    }
                }
            }
        });

        revalidatePath('/portal');
        return { success: true, data: ticket };
    } catch (error) {
        return { success: false, error: 'Erro ao criar ticket' };
    }
}

export async function sendSupportMessage(ticketId: string, content: string) {
    const user = await requireAuth();

    try {
        const message = await prisma.supportMessage.create({
            data: {
                ticketId,
                senderId: user.id,
                content
            }
        });

        // Update ticket's updatedAt for sorting
        await prisma.supportTicket.update({
            where: { id: ticketId },
            data: { updatedAt: new Date() }
        });

        revalidatePath('/portal');
        return { success: true, data: message };
    } catch (error) {
        return { success: false, error: 'Erro ao enviar mensagem' };
    }
}

export async function getTicketMessages(ticketId: string) {
    const user = await requireAuth();

    try {
        const messages = await prisma.supportMessage.findMany({
            where: { ticketId },
            include: {
                sender: { select: { name: true, role: true } }
            },
            orderBy: { createdAt: 'asc' }
        });

        return { success: true, data: messages };
    } catch (error) {
        return { success: false, error: 'Erro ao buscar mensagens' };
    }
}
