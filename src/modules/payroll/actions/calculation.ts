
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { calculateINSS, calculateIRRF, calculateVT } from '../utils/calculations';

// Calculate Single Employee Payslip
export async function calculatePayslip(employeeId: string, periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({ where: { id: periodId } });
        if (!period || period.status === 'CLOSED') {
            return { success: false, error: 'Period is closed or invalid' };
        }

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                contract: true,
                bankData: true
            }
        });

        if (!employee || !employee.contract) {
            return { success: false, error: 'Employee or Contract not found' };
        }

        // 1. Initial Data
        const baseSalary = Number(employee.contract.baseSalary); // Convert Decimal to Number
        const dependents = employee.contract.familySalaryDependents || 0;

        // 2. Earnings Calculation
        // Standard Salary (Code 1001)
        const earnings = [
            { code: '1001', value: baseSalary, reference: 30 } // 30 Days
        ];

        // TODO: Add other earnings (Overtime, Bonus) manually or from TimeTracking later.

        const totalGross = earnings.reduce((acc, curr) => acc + curr.value, 0);

        // 3. Deductions Calculation
        const deductions: { code: string; value: number; reference: number }[] = [];

        // INSS (Code 5001)
        const inss = calculateINSS(totalGross);
        if (inss.value > 0) {
            deductions.push({ code: '5001', value: inss.value, reference: inss.rate });
        }

        // IRRF (Code 5002)
        // Base for IRRF = Gross - INSS - Dependents
        const baseIRRF = totalGross - inss.value;
        const irrf = calculateIRRF(baseIRRF, dependents);
        if (irrf.value > 0) {
            deductions.push({ code: '5002', value: irrf.value, reference: irrf.rate });
        }

        // VT (Code 6001) - If enabled in Contract (assuming logic: we don't have a boolean in schema yet, let's assume always for now or skip)
        // Let's Skip VT auto-calc unless we add a flag "optInVT" to Contract later.

        // Total Deductions
        const totalDeductions = deductions.reduce((acc, curr) => acc + curr.value, 0);
        const netSalary = totalGross - totalDeductions;

        // 4. Save to Database (Upsert Payslip)
        // First, get Event IDs
        const eventCodes = [...earnings.map(e => e.code), ...deductions.map(d => d.code)];
        const events = await prisma.payrollEvent.findMany({
            where: { code: { in: eventCodes } }
        });

        const eventMap = new Map(events.map(e => [e.code, e]));

        // Transaction to ensure consistency
        await prisma.$transaction(async (tx) => {
            // Upsert Payslip Header
            const payslip = await tx.payslip.upsert({
                where: {
                    periodId_employeeId: {
                        periodId,
                        employeeId
                    }
                },
                update: {
                    grossSalary: totalGross,
                    netSalary: netSalary,
                    totalAdditions: totalGross, // Simplified for now
                    totalDeductions: totalDeductions,
                    status: 'CALCULATED',
                    updatedAt: new Date()
                },
                create: {
                    periodId,
                    employeeId,
                    grossSalary: totalGross,
                    netSalary: netSalary,
                    totalAdditions: totalGross,
                    totalDeductions: totalDeductions,
                    status: 'CALCULATED'
                }
            });

            // Delete old items to fully replace (simplest strategy for recalculation)
            await tx.payslipItem.deleteMany({
                where: { payslipId: payslip.id }
            });

            // Insert New Items
            // Earnings
            for (const item of earnings) {
                const evt = eventMap.get(item.code);
                if (evt) {
                    await tx.payslipItem.create({
                        data: {
                            payslipId: payslip.id,
                            eventId: evt.id,
                            name: evt.name,
                            type: evt.type,
                            value: item.value,
                            reference: item.reference
                        }
                    });
                }
            }

            // Deductions
            for (const item of deductions) {
                const evt = eventMap.get(item.code);
                if (evt) {
                    await tx.payslipItem.create({
                        data: {
                            payslipId: payslip.id,
                            eventId: evt.id,
                            name: evt.name,
                            type: evt.type,
                            value: item.value,
                            reference: item.reference // Rate %
                        }
                    });
                }
            }
        });

        revalidatePath(`/dashboard/payroll/${periodId}`);
        return { success: true };

    } catch (error) {
        console.error("Calculation Error:", error);
        return { success: false, error: 'Calculation Failed' };
    }
}

// Bulk Process for Period
export async function calculateAllPayslips(periodId: string) {
    try {
        console.log(`[Payroll] Starting Bulk Calculation for Period: ${periodId}`);

        // Fetch all active employees
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, contract: true }
        });

        console.log(`[Payroll] Found ${employees.length} ACTIVE employees.`);

        let successCount = 0;
        let failCount = 0;

        for (const emp of employees) {
            if (!emp.contract) {
                failCount++;
                continue;
            }

            const res = await calculatePayslip(emp.id, periodId);
            if (res.success) {
                successCount++;
            } else {
                console.error(`[Payroll] Failed to calculate ${emp.name}:`, res.error);
                failCount++;
            }
        }

        console.log(`[Payroll] Finished. Success: ${successCount}, Failed: ${failCount}`);

        revalidatePath('/dashboard/payroll');
        // Force revalidate the specific period page too
        revalidatePath(`/dashboard/payroll/${periodId}`);

        return { success: true, processed: successCount, failed: failCount };

    } catch (error) {
        console.error('[Payroll] Bulk Process Fatal Error:', error);
        return { success: false, error: 'Bulk Process Failed' };
    }
}
