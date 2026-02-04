
/**
 * Payroll Calculation Engine
 * Reference: Tables 2024 (Updating annually)
 */

interface DeductionResult {
    value: number;
    rate: number; // The effective rate or the max bracket rate
}

// ==========================================
// 1. INSS (Contribuição Previdenciária)
// ==========================================
// Tabela Progressiva 2024
const INSS_TABLE_2024 = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 },
];

export function calculateINSS(grossSalary: number): DeductionResult {
    let tax = 0;
    let previousLimit = 0;

    for (const bracket of INSS_TABLE_2024) {
        if (grossSalary > previousLimit) {
            const taxableAmount = Math.min(grossSalary, bracket.limit) - previousLimit;
            tax += taxableAmount * bracket.rate;
            previousLimit = bracket.limit;
        } else {
            break;
        }
    }

    // Cap at the maximum salary limit (Teto do INSS)
    // If salary > last limit, the loop effectively capped calculations at the last bucket difference.
    // Let's double check logic.
    // Example: 10000.
    // 1. (1412 - 0) * 0.075 = 105.90
    // 2. (2666.68 - 1412) * 0.09 = 112.92
    // 3. (4000.03 - 2666.68) * 0.12 = 160.00
    // 4. (7786.02 - 4000.03) * 0.14 = 530.03
    // Total = 908.85 (Teto 2024 is roughly this)

    // Calculate effective rate for display if needed
    const effectiveRate = xRound((tax / grossSalary) * 100);

    return { value: xRound(tax), rate: effectiveRate };
}

// ==========================================
// 2. IRRF (Imposto de Renda)
// ==========================================
// Tabela Progressiva 2024 (Simplificada)
// Base de Cálculo = Bruto - INSS - (Dependentes * 189.59)
const IRRF_TABLE_2024 = [
    { limit: 2259.20, rate: 0.00, deduction: 0.00 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 },
];
const DEDUCTION_PER_DEPENDENT = 189.59;
// Desconto Simplificado (Opcional) - R$ 564,80
// The law says: Use whichever is better for the employee (Deductions vs Simplified Discount).
// For MVP, we will stick to Legal Deductions first as it's standard for CLT.

export function calculateIRRF(baseSalaryForIRRF: number, dependents: number = 0): DeductionResult {
    const basis = baseSalaryForIRRF - (dependents * DEDUCTION_PER_DEPENDENT);

    if (basis <= IRRF_TABLE_2024[0].limit) {
        return { value: 0, rate: 0 };
    }

    let bracket = IRRF_TABLE_2024.find(b => basis <= b.limit || b.limit === Infinity);
    // Fallback just in case
    if (!bracket) bracket = IRRF_TABLE_2024[IRRF_TABLE_2024.length - 1];

    const tax = (basis * bracket.rate) - bracket.deduction;

    return { value: Math.max(0, xRound(tax)), rate: bracket.rate * 100 };
}

// ==========================================
// 3. Vale Transporte
// ==========================================
// 6% do Salário Base (limitado ao valor do custo, mas aqui só calculamos o desconto legal)
export function calculateVT(baseSalary: number): number {
    return xRound(baseSalary * 0.06);
}

// Helper: Round to 2 decimal places to match Currency standards
function xRound(num: number): number {
    return Math.round(num * 100) / 100;
}
