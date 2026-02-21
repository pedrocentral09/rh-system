import { OvertimeCalculator } from '../calculators/OvertimeCalculator';
import { TaxCalculator } from '../calculators/TaxCalculator';

export class EarningsCalculator {
    static generateBaseEarnings(employee: any, settings: any): any[] {
        const items: any[] = [];
        const baseSalary = Number(employee.contract.baseSalary);

        // 1. Salário Base
        items.push({
            code: '1001',
            name: 'Salário Base',
            type: 'EARNING',
            value: baseSalary,
            reference: 30,
            source: 'AUTO'
        });

        // 2. Bônus Mensal
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

        // 3. Insalubridade
        if (employee.contract.hasInsalubrity && employee.contract.insalubrityBase) {
            const minWage = settings.minimumWage;
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

        // 4. Periculosidade
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

        // 5. Cargo de Confiança
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

        // 6. Quebra de Caixa
        if (employee.contract.hasCashHandling && employee.contract.cashHandlingBase) {
            items.push({
                code: '1013',
                name: 'Quebra de Caixa',
                type: 'EARNING',
                value: Number(employee.contract.cashHandlingBase),
                reference: null,
                source: 'AUTO'
            });
        }

        return items;
    }

    static generateTimeTrackingEarningsOrDeductions(employee: any, timeSheetResult: any): any[] {
        const items: any[] = [];
        const baseSalary = Number(employee.contract.baseSalary);
        const { totalBalance } = timeSheetResult;

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
                code: '5003',
                name: abs.description,
                type: 'DEDUCTION',
                value: abs.value,
                reference: abs.hours,
                source: 'SYNC'
            });
        }

        return items;
    }

    static generateFamilySalary(employee: any, totalGross: number, settings: any): any[] {
        const items: any[] = [];
        const dependents = employee.contract.familySalaryDependents || 0;

        const familySalary = TaxCalculator.calculateFamilySalaryDynamic(totalGross, dependents, settings.familySalaryLimit, settings.familySalaryValue);

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
        return items;
    }
}
