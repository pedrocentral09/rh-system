'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/modules/core/actions/auth';

export async function getEmployeePayslips() {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const employee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!employee) throw new Error('Colaborador não encontrado');

        const payslips = await prisma.payslip.findMany({
            where: { employeeId: employee.id },
            include: {
                period: true,
                items: true
            },
            orderBy: {
                period: {
                    year: 'desc',
                }
            }
        });

        // Additional sorting by month (desc)
        const sortedPayslips = payslips.sort((a, b) => {
            if (a.period.year !== b.period.year) return b.period.year - a.period.year;
            return b.period.month - a.period.month;
        });

        return { success: true, data: sortedPayslips };
    } catch (error: any) {
        console.error('[getEmployeePayslips] error:', error);
        return { success: false, error: error.message };
    }
}

export async function getPayslipDetails(payslipId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const employee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!employee) throw new Error('Colaborador não encontrado');

        const payslip = await prisma.payslip.findUnique({
            where: {
                id: payslipId,
                employeeId: employee.id // Security check
            },
            include: {
                period: true,
                items: {
                    orderBy: {
                        type: 'asc' // EARNINGS then DEDUCTIONS
                    }
                },
                employee: {
                    include: {
                        jobRole: true,
                        contract: {
                            include: { store: true }
                        }
                    }
                }
            }
        });

        if (!payslip) throw new Error('Holerite não encontrado');

        return { success: true, data: payslip };
    } catch (error: any) {
        console.error('[getPayslipDetails] error:', error);
        return { success: false, error: error.message };
    }
}

export async function getEmployeeDocuments() {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Não autenticado');

        const employee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!employee) throw new Error('Colaborador não encontrado');

        const documents = await prisma.document.findMany({
            where: { employeeId: employee.id },
            orderBy: { uploadedAt: 'desc' }
        });

        return { success: true, data: documents };
    } catch (error: any) {
        console.error('[getEmployeeDocuments] error:', error);
        return { success: false, error: error.message };
    }
}
