
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getPayrollPeriods() {
    try {
        const periods = await prisma.payrollPeriod.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }],
            include: {
                _count: {
                    select: { payslips: true }
                }
            }
        });
        return { success: true, data: periods };
    } catch (error) {
        console.error('Error fetching periods:', error);
        return { success: false, error: 'Failed to fetch periods' };
    }
}

export async function createPayrollPeriod(month: number, year: number) {
    try {
        // Check if exists
        const existing = await prisma.payrollPeriod.findUnique({
            where: {
                month_year: {
                    month,
                    year
                }
            }
        });

        if (existing) {
            return { success: false, error: 'Competência já existe.' };
        }

        const period = await prisma.payrollPeriod.create({
            data: {
                month,
                year,
                status: 'OPEN'
            }
        });

        revalidatePath('/dashboard/payroll');
        return { success: true, data: period };
    } catch (error) {
        console.error('Error creating period:', error);
        return { success: false, error: 'Failed to create period' };
    }

}

export async function getPayrollPeriodById(id: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({
            where: { id },
            include: {
                payslips: {
                    include: {
                        employee: true,
                        items: {
                            include: { event: true },
                            orderBy: { type: 'asc' } // Earnings first usually? Or code?
                        }
                    },
                    orderBy: { employee: { name: 'asc' } }
                }
            }
        });
        return { success: true, data: period };
    } catch (error) {
        console.error('Error fetching period:', error);
        return { success: false, error: 'Failed to fetch period' };
    }
}

export async function closePayrollPeriod(id: string) {
    try {
        await prisma.payrollPeriod.update({
            where: { id },
            data: { status: 'CLOSED' }
        });
        revalidatePath(`/dashboard/payroll/${id}`);
        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        console.error('Error closing period:', error);
        return { success: false, error: 'Failed to close period' };
    }
}

export async function reopenPayrollPeriod(id: string) {
    try {
        await prisma.payrollPeriod.update({
            where: { id },
            data: { status: 'OPEN' }
        });
        revalidatePath(`/dashboard/payroll/${id}`);
        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        console.error('Error reopening period:', error);
        return { success: false, error: 'Failed to reopen period' };
    }
}

export async function getPayslipDetails(payslipId: string) {
    try {
        const payslip = await prisma.payslip.findUnique({
            where: { id: payslipId },
            include: {
                period: true,
                employee: true,
                items: {
                    include: { event: true },
                    orderBy: { type: 'asc' }
                }
            }
        });

        // Mock Company Info (since it's in config table)
        // In real world, fetch from CompanySettings
        const company = {
            name: 'Empresa Exemplo Ltda',
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            cnpj: '12.345.678/0001-99'
        };

        return { success: true, data: payslip, company };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
