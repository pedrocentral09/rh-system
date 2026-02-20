
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
                },
                payslips: {
                    select: { grossSalary: true, netSalary: true }
                }
            }
        });

        // Agregação manual e limpeza de objetos Decimal para evitar erro de serialização no Next.js
        const data = periods.map(p => {
            const totalGross = p.payslips.reduce((acc, curr) => acc + Number(curr.grossSalary), 0);
            const totalNet = p.payslips.reduce((acc, curr) => acc + Number(curr.netSalary), 0);

            // Removemos a lista bruta de payslips que contém objetos Decimal do Prisma
            const { payslips, ...periodData } = p;

            return {
                ...periodData,
                totalGross,
                totalNet,
            };
        });

        return { success: true, data };
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
                        period: true, // Adicionado para resolver Ref: /
                        employee: {
                            include: { contract: { include: { company: true, store: true } } }
                        },
                        items: {
                            include: { event: true },
                            orderBy: { type: 'asc' } // Earnings first usually? Or code?
                        }
                    },
                    orderBy: { employee: { name: 'asc' } }
                }
            }
        });
        if (!period) return { success: true, data: null };

        // Serialização: converter Decimal para number (Next.js Client Components não aceitam objetos Decimal)
        const serializedData = {
            ...period,
            payslips: period.payslips.map(p => ({
                ...p,
                grossSalary: Number(p.grossSalary),
                netSalary: Number(p.netSalary),
                totalAdditions: Number(p.totalAdditions),
                totalDeductions: Number(p.totalDeductions),
                employee: {
                    ...p.employee,
                    contract: p.employee.contract ? {
                        ...p.employee.contract,
                        baseSalary: Number(p.employee.contract.baseSalary),
                        insalubrityBase: Number(p.employee.contract.insalubrityBase || 0),
                        dangerousnessBase: Number(p.employee.contract.dangerousnessBase || 0),
                        trustPositionBase: Number(p.employee.contract.trustPositionBase || 0),
                        cashHandlingBase: Number(p.employee.contract.cashHandlingBase || 0),
                        monthlyBonus: Number(p.employee.contract.monthlyBonus || 0),
                        transportVoucherValue: Number(p.employee.contract.transportVoucherValue || 0),
                        mealVoucherValue: Number(p.employee.contract.mealVoucherValue || 0),
                        foodVoucherValue: Number(p.employee.contract.foodVoucherValue || 0),
                    } : null
                },
                items: p.items.map(i => ({
                    ...i,
                    value: Number(i.value),
                    reference: i.reference ? Number(i.reference) : null,
                }))
            }))
        };

        return { success: true, data: serializedData };
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
                employee: {
                    include: { contract: { include: { company: true, store: true } } }
                },
                items: {
                    include: { event: true },
                    orderBy: { type: 'asc' }
                }
            }
        });

        if (!payslip) return { success: true, data: null };

        // Serialização
        const serializedPayslip = {
            ...payslip,
            grossSalary: Number(payslip.grossSalary),
            netSalary: Number(payslip.netSalary),
            totalAdditions: Number(payslip.totalAdditions),
            totalDeductions: Number(payslip.totalDeductions),
            employee: {
                ...payslip.employee,
                contract: payslip.employee.contract ? {
                    ...payslip.employee.contract,
                    baseSalary: Number(payslip.employee.contract.baseSalary),
                    insalubrityBase: Number(payslip.employee.contract.insalubrityBase || 0),
                    dangerousnessBase: Number(payslip.employee.contract.dangerousnessBase || 0),
                    trustPositionBase: Number(payslip.employee.contract.trustPositionBase || 0),
                    cashHandlingBase: Number(payslip.employee.contract.cashHandlingBase || 0),
                    monthlyBonus: Number(payslip.employee.contract.monthlyBonus || 0),
                    transportVoucherValue: Number(payslip.employee.contract.transportVoucherValue || 0),
                    mealVoucherValue: Number(payslip.employee.contract.mealVoucherValue || 0),
                    foodVoucherValue: Number(payslip.employee.contract.foodVoucherValue || 0),
                } : null
            },
            items: payslip.items.map(i => ({
                ...i,
                value: Number(i.value),
                reference: i.reference ? Number(i.reference) : null,
            }))
        };

        // Mock Company Info (since it's in config table)
        // In real world, fetch from CompanySettings
        const company = {
            name: 'Empresa Exemplo Ltda',
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            cnpj: '12.345.678/0001-99'
        };

        return { success: true, data: serializedPayslip, company };
    } catch (error) {
        return { success: false, error: 'Failed' };
    }
}
