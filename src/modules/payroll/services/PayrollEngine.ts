import { prisma } from '@/lib/prisma';
import { PayrollDataProvider } from './providers/PayrollDataProvider';
import { EarningsCalculator } from './core/EarningsCalculator';
import { DeductionsCalculator } from './core/DeductionsCalculator';
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';

export interface CalculationResult {
    success: boolean;
    error?: string;
    items?: any[];
    totals?: {
        gross: number;
        net: number;
        additions: number;
        deductions: number;
    };
}

export class PayrollEngine {
    /**
     * Calcula o holerite completo para um funcionário em um período específico
     * REFATORADO: Arquitetura Limpa + Providers
     */
    static async calculatePayslip(employeeId: string, periodId: string, syncTime: boolean = true): Promise<CalculationResult> {
        try {
            const period = await prisma.payrollPeriod.findUnique({ where: { id: periodId } });
            if (!period || period.status === 'CLOSED') {
                return { success: false, error: 'Período inválido ou já encerrado.' };
            }

            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: { contract: true }
            });

            if (!employee || !employee.contract) {
                return { success: false, error: 'Funcionário ou contrato não encontrado.' };
            }

            // 1. Coleta de Dados Isolada (Sem misturar com cálculo)
            const settings = await PayrollDataProvider.getSettings();
            const inssBrackets = await PayrollDataProvider.getINSSBrackets(period.year);
            const irrfBrackets = await PayrollDataProvider.getIRRFBrackets(period.year);
            const advanceAmount = await PayrollDataProvider.getAdvances(employeeId, periodId);
            const loanAmount = await PayrollDataProvider.getLoans(employeeId, periodId);
            const externalImports = await PayrollDataProvider.getExternalImports(employeeId, periodId);

            // 2. Cálculo Puros
            let items: any[] = [];

            // 2.1 Proventos Básicos e do Contrato
            items = items.concat(EarningsCalculator.generateBaseEarnings(employee, settings));

            // 2.2 Proventos/Descontos de Ponto (Horas Extras/Faltas)
            if (syncTime) {
                const tsResult = await getTimeSheet(employeeId, period.month, period.year);
                if (tsResult.success && tsResult.data) {
                    items = items.concat(EarningsCalculator.generateTimeTrackingEarningsOrDeductions(employee, tsResult.data));
                }
            }

            // Sub-Total de Proventos para calcular Impostos e Família
            const totalGross = items
                .filter(i => i.type === 'EARNING')
                .reduce((acc, i) => acc + i.value, 0);

            // 2.3 Salário Família Dinâmico
            items = items.concat(EarningsCalculator.generateFamilySalary(employee, totalGross, settings));

            // 2.4 Benefícios (Vale Transporte)
            items = items.concat(DeductionsCalculator.generateTransportVoucher(employee));

            // 2.5 Impostos Oficiais
            items = items.concat(DeductionsCalculator.generateTaxes(employee, totalGross, inssBrackets, irrfBrackets));

            // 2.6 Descontos Externos (Empréstimo, Adiantamento, ERP)
            items = items.concat(DeductionsCalculator.generateExternalDeductions(advanceAmount, loanAmount, externalImports));

            // 3. Somatórios Finais
            const totalAdditions = items
                .filter(i => i.type === 'EARNING')
                .reduce((acc, i) => acc + i.value, 0);

            const totalDeductions = items
                .filter(i => i.type === 'DEDUCTION')
                .reduce((acc, i) => acc + i.value, 0);

            const netSalary = Math.max(0, totalAdditions - totalDeductions); // Evitar saldo negativo estrutural se configurado

            return {
                success: true,
                items,
                totals: {
                    gross: totalGross, // Base Gross real
                    net: netSalary,
                    additions: totalAdditions,
                    deductions: totalDeductions
                }
            };

        } catch (error: any) {
            console.error('[PayrollEngine] Erro no cálculo:', error);
            return { success: false, error: error.message };
        }
    }
}
