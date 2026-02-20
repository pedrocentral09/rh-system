
/**
 * Calculadora de Impostos (INSS e IRRF)
 * Referência: Tabelas 2024
 */

export interface TaxResult {
    value: number;
    rate: number;
    baseValue: number;
}

const INSS_TABLE_2024 = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 },
];

const IRRF_TABLE_2024 = [
    { limit: 2259.20, rate: 0.00, deduction: 0.00 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 },
];

const DEDUCTION_PER_DEPENDENT = 189.59;
const MINIMUM_WAGE_2024 = 1412.00;
const FAMILY_SALARY_LIMIT_2024 = 1819.26;
const FAMILY_SALARY_VALUE_2024 = 62.04;

export class TaxCalculator {
    /**
     * Calcula o INSS progressivo baseado em uma tabela dinâmica do banco
     */
    static calculateINSSDynamic(grossSalary: number, brackets: any[]): TaxResult {
        let tax = 0;
        let previousLimit = 0;

        // Sort brackets by limit just in case
        const sortedBrackets = [...brackets].sort((a, b) => Number(a.limit) - Number(b.limit));

        for (const bracket of sortedBrackets) {
            const limit = Number(bracket.limit);
            const rate = Number(bracket.rate);

            if (grossSalary > previousLimit) {
                const taxableAmount = Math.min(grossSalary, limit) - previousLimit;
                tax += taxableAmount * (rate / 100); // Assumes rate is 7.5, not 0.075 in DB
                previousLimit = limit;
            } else {
                break;
            }
        }

        const effectiveRate = grossSalary > 0 ? (tax / grossSalary) * 100 : 0;

        return {
            value: this.round(tax),
            rate: this.round(effectiveRate),
            baseValue: grossSalary
        };
    }

    /**
     * Calcula o IRRF baseado em tabela dinâmica
     */
    static calculateIRRFDynamic(baseSalary: number, dependents: number, brackets: any[], deductionPerDependent: number = 189.59): TaxResult {
        const basis = baseSalary - (dependents * deductionPerDependent);

        // Sort brackets by limit
        const sortedBrackets = [...brackets].sort((a, b) => Number(a.limit) - Number(b.limit));

        // Find the correct bracket
        let bracket = sortedBrackets.find(b => basis <= Number(b.limit));
        // If not found, use the last one (Infinity)
        if (!bracket) bracket = sortedBrackets[sortedBrackets.length - 1];

        if (!bracket) return { value: 0, rate: 0, baseValue: basis };

        const rate = Number(bracket.rate) / 100;
        const deduction = Number(bracket.deduction);

        const tax = (basis * rate) - deduction;

        return {
            value: Math.max(0, this.round(tax)),
            rate: rate * 100,
            baseValue: basis
        };
    }

    /**
     * Calcula o Salário Família com bases dinâmicas
     */
    static calculateFamilySalaryDynamic(grossSalary: number, dependents: number, limit: number, valuePerDependent: number): number {
        if (grossSalary <= limit && dependents > 0) {
            return this.round(dependents * valuePerDependent);
        }
        return 0;
    }

    // Keep legacy methods for compatibility or internal use during migration
    static calculateINSS(grossSalary: number): TaxResult {
        return this.calculateINSSDynamic(grossSalary, INSS_TABLE_2024.map(b => ({ ...b, rate: b.rate * 100 })));
    }

    static calculateIRRF(baseSalary: number, dependents: number = 0): TaxResult {
        return this.calculateIRRFDynamic(baseSalary, dependents, IRRF_TABLE_2024.map(b => ({ ...b, rate: b.rate * 100 })), DEDUCTION_PER_DEPENDENT);
    }

    static calculateFamilySalary(grossSalary: number, dependents: number): number {
        return this.calculateFamilySalaryDynamic(grossSalary, dependents, FAMILY_SALARY_LIMIT_2024, FAMILY_SALARY_VALUE_2024);
    }

    private static round(num: number): number {
        return Math.round(num * 100) / 100;
    }
}
