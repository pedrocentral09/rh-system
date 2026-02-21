import { TaxCalculator } from '../calculators/TaxCalculator';

export class DeductionsCalculator {
    static generateTransportVoucher(employee: any): any[] {
        const items: any[] = [];
        const baseSalary = Number(employee.contract.baseSalary);

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
        return items;
    }

    static generateTaxes(employee: any, totalGross: number, inssBrackets: any[], irrfBrackets: any[]): any[] {
        const items: any[] = [];
        const dependents = employee.contract.familySalaryDependents || 0;

        // INSS
        const inss = TaxCalculator.calculateINSSDynamic(totalGross, inssBrackets);
        items.push({
            code: '5001',
            name: 'INSS',
            type: 'DEDUCTION',
            value: inss.value,
            reference: inss.rate,
            source: 'AUTO'
        });

        // IRRF
        const baseIRRF = totalGross - inss.value;
        const irrf = TaxCalculator.calculateIRRFDynamic(baseIRRF, dependents, irrfBrackets);
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

        return items;
    }

    static generateExternalDeductions(advanceAmount: number, loanAmount: number, externalImports: any[]): any[] {
        const items: any[] = [];

        if (advanceAmount > 0) {
            items.push({
                code: '5004',
                name: 'Adiantamento de Salário',
                type: 'DEDUCTION',
                value: advanceAmount,
                reference: null,
                source: 'AUTO'
            });
        }

        if (loanAmount > 0) {
            items.push({
                code: '5005',
                name: 'Empréstimo Consignado',
                type: 'DEDUCTION',
                value: loanAmount,
                reference: null,
                source: 'AUTO'
            });
        }

        if (externalImports && externalImports.length > 0) {
            externalImports.forEach(imp => {
                items.push({
                    code: imp.itemCode,
                    name: imp.label,
                    type: 'DEDUCTION',
                    value: Number(imp.amount),
                    reference: null,
                    source: 'AUTO'
                });
            });
        }

        return items;
    }
}
