
import { prisma } from '@/lib/prisma';
import { TaxCalculator } from './calculators/TaxCalculator';
import { OvertimeCalculator } from './calculators/OvertimeCalculator';
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

            // 1. Buscar Configurações e Tabelas de Impostos do Banco com Fallback SQL
            const p = prisma as any;
            let settings: any = null;
            if (p.payrollSettings) {
                settings = await p.payrollSettings.findUnique({ where: { id: 'default' } });
            } else {
                const results: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "payroll_settings" WHERE id = \'default\' LIMIT 1');
                settings = results && results.length > 0 ? results[0] : null;
            }

            const minWage = settings ? Number(settings.minimumWage) : 1412.00;
            const famLimit = settings ? Number(settings.familySalaryLimit) : 1819.26;
            const famValue = settings ? Number(settings.familySalaryValue) : 62.04;

            let finalInssBrackets: any[] = [];
            let finalIrrfBrackets: any[] = [];

            if (p.taxTable && p.taxBracket) {
                const inssTable = await p.taxTable.findUnique({
                    where: { name_year: { name: 'INSS', year: period.year } },
                    include: { brackets: true }
                });
                const irrfTable = await p.taxTable.findUnique({
                    where: { name_year: { name: 'IRRF', year: period.year } },
                    include: { brackets: true }
                });

                const fallbackYear = 2024;
                finalInssBrackets = (inssTable?.brackets.length ? inssTable.brackets :
                    (await p.taxBracket.findMany({ where: { table: { name: 'INSS', year: fallbackYear } }, orderBy: { order: 'asc' } })));

                finalIrrfBrackets = (irrfTable?.brackets.length ? irrfTable.brackets :
                    (await p.taxBracket.findMany({ where: { table: { name: 'IRRF', year: fallbackYear } }, orderBy: { order: 'asc' } })));
            } else {
                console.warn('[DEBUG] PayrollEngine: Tax tables missing, using RAW SQL...');
                // RAW SQL for INSS
                const inssTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'INSS' AND year = ${period.year} LIMIT 1`);
                const inssTableId = inssTables && inssTables.length > 0 ? inssTables[0].id : null;

                if (inssTableId) {
                    finalInssBrackets = await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${inssTableId}' ORDER BY "order" ASC`);
                } else {
                    // Fallback to 2024
                    const fbInssTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'INSS' AND year = 2024 LIMIT 1`);
                    const fbInssId = fbInssTables && fbInssTables.length > 0 ? fbInssTables[0].id : null;
                    if (fbInssId) finalInssBrackets = await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${fbInssId}' ORDER BY "order" ASC`);
                }

                // RAW SQL for IRRF
                const irrfTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'IRRF' AND year = ${period.year} LIMIT 1`);
                const irrfTableId = irrfTables && irrfTables.length > 0 ? irrfTables[0].id : null;

                if (irrfTableId) {
                    finalIrrfBrackets = await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${irrfTableId}' ORDER BY "order" ASC`);
                } else {
                    const fbIrrfTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'IRRF' AND year = 2024 LIMIT 1`);
                    const fbIrrfId = fbIrrfTables && fbIrrfTables.length > 0 ? fbIrrfTables[0].id : null;
                    if (fbIrrfId) finalIrrfBrackets = await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${fbIrrfId}' ORDER BY "order" ASC`);
                }
            }

            const items: any[] = [];
            const baseSalary = Number(employee.contract.baseSalary);

            // 1. Proventos Básicos (Salário)
            items.push({
                code: '1001',
                name: 'Salário Base',
                type: 'EARNING',
                value: baseSalary,
                reference: 30,
                source: 'AUTO'
            });

            // 2. Adicionais e Bônus do Contrato
            // Bônus Mensal
            if (employee.contract.monthlyBonus && Number(employee.contract.monthlyBonus) > 0) {
                items.push({
                    code: '1020',
                    name: 'Bônus Mensal',
                    type: 'EARNING',
                    value: Number(employee.contract.monthlyBonus),
                    reference: null,
                    source: 'AUTO'
                });
            }

            // Insalubrity (Calculado sobre Salário Mínimo do Banco)
            if (employee.contract.hasInsalubrity && employee.contract.insalubrityBase) {
                const value = minWage * (Number(employee.contract.insalubrityBase) / 100);
                items.push({
                    code: '1010',
                    name: `Insalubrity (${employee.contract.insalubrityBase}%)`,
                    type: 'EARNING',
                    value: value,
                    reference: Number(employee.contract.insalubrityBase),
                    source: 'AUTO'
                });
            }

            // Periculosidade (30% sobre o Salário Base)
            if (employee.contract.hasDangerousness) {
                const value = baseSalary * 0.3;
                items.push({
                    code: '1011',
                    name: 'Periculosidade (30%)',
                    type: 'EARNING',
                    value: value,
                    reference: 30,
                    source: 'AUTO'
                });
            }

            // Cargo de Confiança (40% sobre o Salário Base)
            if (employee.contract.hasTrustPosition && employee.contract.trustPositionBase) {
                const value = baseSalary * (Number(employee.contract.trustPositionBase) / 100);
                items.push({
                    code: '1012',
                    name: `Gratificação de Função (${employee.contract.trustPositionBase}%)`,
                    type: 'EARNING',
                    value: value,
                    reference: Number(employee.contract.trustPositionBase),
                    source: 'AUTO'
                });
            }

            // Quebra de Caixa
            if (employee.contract.hasCashHandling && employee.contract.cashHandlingBase) {
                const value = Number(employee.contract.cashHandlingBase);
                items.push({
                    code: '1013',
                    name: 'Quebra de Caixa',
                    type: 'EARNING',
                    value: value,
                    reference: null,
                    source: 'AUTO'
                });
            }

            // 3. Integração com Ponto (Horas Extras e Faltas)
            if (syncTime) {
                const tsResult = await getTimeSheet(employeeId, period.month, period.year);
                if (tsResult.success && tsResult.data) {
                    const { totalBalance } = tsResult.data;
                    if (totalBalance > 0) {
                        const ot = OvertimeCalculator.calculateOvertime(baseSalary, totalBalance);
                        items.push({
                            code: '1002',
                            name: ot.description,
                            type: 'EARNING',
                            value: ot.value,
                            reference: ot.hours,
                            source: 'SYNC'
                        });
                    } else if (totalBalance < 0) {
                        const abs = OvertimeCalculator.calculateAbsence(baseSalary, Math.abs(totalBalance));
                        items.push({
                            code: '5003', // Código para faltas
                            name: abs.description,
                            type: 'DEDUCTION',
                            value: abs.value,
                            reference: abs.hours,
                            source: 'SYNC'
                        });
                    }
                }
            }

            // 4. Totais Parciais para Cálculo de Impostos
            const totalGross = items
                .filter(i => i.type === 'EARNING')
                .reduce((acc, i) => acc + i.value, 0);

            const dependents = employee.contract.familySalaryDependents || 0;

            // 5. Salário Família Dinâmico
            const familySalary = TaxCalculator.calculateFamilySalaryDynamic(totalGross, dependents, famLimit, famValue);
            if (familySalary > 0) {
                items.push({
                    code: '1014',
                    name: 'Salário Família',
                    type: 'EARNING',
                    value: familySalary,
                    reference: dependents,
                    source: 'AUTO'
                });
            }

            // 6. Desconto de Vale Transporte (6% sobre Salário Base)
            if (employee.contract.hasTransportVoucher) {
                const vtValue = baseSalary * 0.06;
                items.push({
                    code: '6001',
                    name: 'Vale Transporte (6%)',
                    type: 'DEDUCTION',
                    value: vtValue,
                    reference: 6,
                    source: 'AUTO'
                });
            }

            // 7. Desconto de INSS Dinâmico
            const inss = TaxCalculator.calculateINSSDynamic(totalGross, finalInssBrackets);
            items.push({
                code: '5001',
                name: 'INSS',
                type: 'DEDUCTION',
                value: inss.value,
                reference: inss.rate,
                source: 'AUTO'
            });

            // 8. Desconto de IRRF Dinâmico
            const baseIRRF = totalGross - inss.value;
            const irrf = TaxCalculator.calculateIRRFDynamic(baseIRRF, dependents, finalIrrfBrackets);
            if (irrf.value > 0) {
                items.push({
                    code: '5002',
                    name: 'IRRF',
                    type: 'DEDUCTION',
                    value: irrf.value,
                    reference: irrf.rate,
                    source: 'AUTO'
                });
            }

            // 6. Cálculo Final de Totais
            const totalAdditions = items
                .filter(i => i.type === 'EARNING')
                .reduce((acc, i) => acc + i.value, 0);
            const totalDeductions = items
                .filter(i => i.type === 'DEDUCTION')
                .reduce((acc, i) => acc + i.value, 0);
            const netSalary = totalAdditions - totalDeductions;

            return {
                success: true,
                items,
                totals: {
                    gross: totalGross,
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
