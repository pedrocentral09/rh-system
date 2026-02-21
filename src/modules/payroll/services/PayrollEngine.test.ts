import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayrollEngine } from './PayrollEngine';

const { mockPrisma } = vi.hoisted(() => {
    return {
        mockPrisma: {
            payrollPeriod: { findUnique: vi.fn() },
            employee: { findUnique: vi.fn() },
            $queryRawUnsafe: vi.fn(),
            $queryRaw: vi.fn(),
        }
    };
});

vi.mock('@/lib/prisma', () => ({
    prisma: mockPrisma
}));

// Mocks complementares se houver no getTimeSheet
vi.mock('@/modules/time-tracking/actions/timesheet', () => ({
    getTimeSheet: vi.fn().mockResolvedValue({ success: true, data: { totalBalance: 0 } })
}));

describe('PayrollEngine - Characterization Tests', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Deve calcular corretamente o holerite de um Salário Base Simples (Abaixo do Teto)', async () => {
        // Mock Setup
        mockPrisma.payrollPeriod.findUnique.mockResolvedValue({ id: 'period-1', month: 1, year: 2024, status: 'OPEN' });

        mockPrisma.employee.findUnique.mockResolvedValue({
            id: 'emp-1',
            contract: {
                baseSalary: 2000,
                monthlyBonus: null,
                hasInsalubrity: false,
                hasDangerousness: false,
                hasTrustPosition: false,
                hasCashHandling: false,
                familySalaryDependents: 0,
                hasTransportVoucher: false
            }
        });

        // Mock das queries RAW do PostgreSQL (Tabelas de imposto, vales, adiantamentos)
        mockPrisma.$queryRawUnsafe.mockImplementation(async (query: string) => {
            if (query.includes('payroll_settings')) return [{ minimumWage: 1412, familySalaryLimit: 1819.26, familySalaryValue: 62.04 }];
            if (query.includes('payroll_tax_tables') && query.includes('INSS')) return [{ id: 'inss-1' }];
            if (query.includes('payroll_tax_brackets') && query.includes('inss-1')) {
                return [
                    { limit: '1412', rate: '7.5', deduction: '0', order: 1 },
                    { limit: '2666.68', rate: '9', deduction: '21.18', order: 2 },
                    { limit: '4000.03', rate: '12', deduction: '101.18', order: 3 },
                    { limit: '7786.02', rate: '14', deduction: '181.18', order: 4 },
                ];
            }
            if (query.includes('payroll_tax_tables') && query.includes('IRRF')) return [{ id: 'irrf-1' }];
            if (query.includes('payroll_tax_brackets') && query.includes('irrf-1')) {
                return [
                    { limit: '2259.20', rate: '0', deduction: '0', order: 1 },
                    { limit: '2826.65', rate: '7.5', deduction: '169.44', order: 2 },
                    { limit: '3751.05', rate: '15', deduction: '381.44', order: 3 },
                    { limit: '4664.68', rate: '22.5', deduction: '662.77', order: 4 },
                    { limit: '999999', rate: '27.5', deduction: '896', order: 5 },
                ];
            }
            return [];
        });

        mockPrisma.$queryRaw.mockResolvedValue([]); // Mocks para queryRaw template literals (Empréstimo, Adiantamentos)

        const result = await PayrollEngine.calculatePayslip('emp-1', 'period-1', false);

        expect(result.success).toBe(true);

        // Validar INSS para 2000
        // Faixa 1: 1412 * 7.5% = 105.9
        // Faixa 2: (2000 - 1412) = 588 * 9% = 52.92
        // Total INSS: 158.82

        const inssItem = result.items?.find((i: any) => i.code === '5001');
        expect(inssItem).toBeDefined();
        expect(inssItem?.value).toBeCloseTo(158.82, 2);

        // Salário Base
        const salarioItem = result.items?.find((i: any) => i.code === '1001');
        expect(salarioItem?.value).toBe(2000);

        // Totais
        expect(result.totals?.gross).toBe(2000);
        expect(result.totals?.deductions).toBeCloseTo(158.82, 2); // Apenas INSS
        expect(result.totals?.net).toBeCloseTo(2000 - 158.82, 2);
    });

    it('Deve calcular corretamente um Holerite complexo com Dependentes, IRRF e adicionais', async () => {
        // Mock Setup
        mockPrisma.payrollPeriod.findUnique.mockResolvedValue({ id: 'period-2', month: 2, year: 2024, status: 'OPEN' });

        mockPrisma.employee.findUnique.mockResolvedValue({
            id: 'emp-2',
            contract: {
                baseSalary: 4500,
                monthlyBonus: 500, // Totais = 5000 Gross
                hasInsalubrity: false,
                hasDangerousness: true, // + 30% salBase = 1350
                hasTrustPosition: false,
                hasCashHandling: false,
                familySalaryDependents: 2,
                hasTransportVoucher: true
            }
        });

        // Totais Gross = 4500 + 500 + 1350 = 6350
        // INSS sobre 6350:
        // F1: 105.90
        // F2: 112.92
        // F3: 160.00
        // F4: (6350 - 4000.03) = 2349.97 * 14% = 328.99
        // INSS Total = 105.90 + 112.92 + 160.00 + 328.99 = 707.81
        // Base IRRF = 6350 - 707.81 - (2 * 189.59) = 5263.01
        // IRRF na faixa 5 (27.5% com dedução de 896): (5263.01 * 0.275) - 896 = 1447.32 - 896 = 551.32
        // VT: 4500 * 6% = 270.00

        mockPrisma.$queryRawUnsafe.mockImplementation(async (query: string) => {
            if (query.includes('payroll_settings')) return [{ minimumWage: 1412, familySalaryLimit: 1819.26, familySalaryValue: 62.04 }];
            if (query.includes('payroll_tax_tables') && query.includes('INSS')) return [{ id: 'inss-1' }];
            if (query.includes('payroll_tax_brackets') && query.includes('inss-1')) {
                return [
                    { limit: '1412', rate: '7.5', deduction: '0', order: 1 },
                    { limit: '2666.68', rate: '9', deduction: '21.18', order: 2 },
                    { limit: '4000.03', rate: '12', deduction: '101.18', order: 3 },
                    { limit: '7786.02', rate: '14', deduction: '181.18', order: 4 },
                ];
            }
            if (query.includes('payroll_tax_tables') && query.includes('IRRF')) return [{ id: 'irrf-1' }];
            if (query.includes('payroll_tax_brackets') && query.includes('irrf-1')) {
                return [
                    { limit: '2259.20', rate: '0', deduction: '0', order: 1 },
                    { limit: '2826.65', rate: '7.5', deduction: '169.44', order: 2 },
                    { limit: '3751.05', rate: '15', deduction: '381.44', order: 3 },
                    { limit: '4664.68', rate: '22.5', deduction: '662.77', order: 4 },
                    { limit: '999999', rate: '27.5', deduction: '896', order: 5 },
                ];
            }
            return [];
        });

        mockPrisma.$queryRaw.mockResolvedValue([]); // No loans, advances, imports

        const result = await PayrollEngine.calculatePayslip('emp-2', 'period-2', false);

        expect(result.success).toBe(true);

        const inssItem = result.items?.find((i: any) => i.code === '5001');
        expect(inssItem?.value).toBeCloseTo(707.81, 1);

        const irrfItem = result.items?.find((i: any) => i.code === '5002');
        expect(irrfItem?.value).toBeCloseTo(551.32, 1);

        const vtItem = result.items?.find((i: any) => i.code === '6001');
        expect(vtItem?.value).toBe(270.00);

        expect(result.totals?.gross).toBe(6350);
        expect(result.totals?.deductions).toBeCloseTo(707.81 + 551.32 + 270.00, 1);
        expect(result.totals?.net).toBeCloseTo(6350 - (707.81 + 551.32 + 270.00), 1);
    });
});
