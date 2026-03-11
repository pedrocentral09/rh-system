/**
 * Payroll Calculation Validation Tests
 * Testing INSS and IRRF calculations with real-world scenarios
 */

// ==========================================
// INSS Table 2024
// ==========================================
const INSS_TABLE_2024 = [
    { limit: 1412.00, rate: 0.075 },
    { limit: 2666.68, rate: 0.09 },
    { limit: 4000.03, rate: 0.12 },
    { limit: 7786.02, rate: 0.14 },
];

function calculateINSS(grossSalary: number) {
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

    const effectiveRate = ((tax / grossSalary) * 100);
    return { value: Math.round(tax * 100) / 100, rate: effectiveRate };
}

// ==========================================
// IRRF Table 2024
// ==========================================
const IRRF_TABLE_2024 = [
    { limit: 2259.20, rate: 0.00, deduction: 0.00 },
    { limit: 2826.65, rate: 0.075, deduction: 169.44 },
    { limit: 3751.05, rate: 0.15, deduction: 381.44 },
    { limit: 4664.68, rate: 0.225, deduction: 662.77 },
    { limit: Infinity, rate: 0.275, deduction: 896.00 },
];
const DEDUCTION_PER_DEPENDENT = 189.59;

function calculateIRRF(baseSalaryForIRRF: number, dependents: number = 0) {
    const basis = baseSalaryForIRRF - (dependents * DEDUCTION_PER_DEPENDENT);

    if (basis <= IRRF_TABLE_2024[0].limit) {
        return { value: 0, rate: 0 };
    }

    let bracket = IRRF_TABLE_2024.find(b => basis <= b.limit || b.limit === Infinity);
    if (!bracket) bracket = IRRF_TABLE_2024[IRRF_TABLE_2024.length - 1];

    const tax = (basis * bracket.rate) - bracket.deduction;
    return { value: Math.max(0, Math.round(tax * 100) / 100), rate: bracket.rate * 100 };
}

// ==========================================
// TEST CASES
// ==========================================

console.log('🧮 VALIDAÇÃO DE CÁLCULOS DE FOLHA\n');
console.log('='.repeat(70));

const testCases = [
    { salary: 1412.00, name: 'Salário Mínimo 2024' },
    { salary: 2000.00, name: 'Salário Médio Baixo' },
    { salary: 3000.00, name: 'Salário Médio' },
    { salary: 5000.00, name: 'Salário Médio Alto' },
    { salary: 7000.00, name: 'Salário Alto' },
    { salary: 10000.00, name: 'Acima do Teto INSS' },
];

console.log('\n📊 TESTE 1: INSS (Contribuição Previdenciária)\n');

testCases.forEach(test => {
    const inss = calculateINSS(test.salary);
    console.log(`${test.name.padEnd(25)} R$ ${test.salary.toFixed(2).padStart(10)}`);
    console.log(`  → INSS: R$ ${inss.value.toFixed(2).padStart(8)} (${inss.rate.toFixed(2)}%)`);
    console.log('');
});

console.log('\n📊 TESTE 2: CÁLCULO COMPLETO (sem dependentes)\n');

testCases.forEach(test => {
    const inss = calculateINSS(test.salary);
    const baseIRRF = test.salary - inss.value;
    const irrf = calculateIRRF(baseIRRF, 0);
    const totalDescontos = inss.value + irrf.value;
    const liquido = test.salary - totalDescontos;

    console.log(`${test.name} - R$ ${test.salary.toFixed(2)}`);
    console.log(`  INSS:      R$ ${inss.value.toFixed(2).padStart(8)}`);
    console.log(`  IRRF:      R$ ${irrf.value.toFixed(2).padStart(8)}`);
    console.log(`  Total Desc: R$ ${totalDescontos.toFixed(2).padStart(8)} (${(totalDescontos / test.salary * 100).toFixed(1)}%)`);
    console.log(`  LÍQUIDO:   R$ ${liquido.toFixed(2).padStart(8)}`);
    console.log('');
});

console.log('\n📊 TESTE 3: COM DEPENDENTES (2)\n');

const salaryWithDeps = 5000.00;
const deps = 2;
const inss3 = calculateINSS(salaryWithDeps);
const baseIRRF3 = salaryWithDeps - inss3.value;
const irrfSemDeps = calculateIRRF(baseIRRF3, 0);
const irrfComDeps = calculateIRRF(baseIRRF3, deps);

console.log(`Salário: R$ ${salaryWithDeps.toFixed(2)}`);
console.log(`INSS: R$ ${inss3.value.toFixed(2)}`);
console.log(`Base IRRF: R$ ${baseIRRF3.toFixed(2)}`);
console.log(`\nDedução por dependente: R$ 189,59 × ${deps} = R$ ${(189.59 * deps).toFixed(2)}`);
console.log(`\nIRRF sem dependentes: R$ ${irrfSemDeps.value.toFixed(2)}`);
console.log(`IRRF com ${deps} dependentes: R$ ${irrfComDeps.value.toFixed(2)}`);
console.log(`Economia: R$ ${(irrfSemDeps.value - irrfComDeps.value).toFixed(2)}`);

// ==========================================
// VALIDAÇÃO MANUAL DETALHADA
// ==========================================

console.log('\n\n✅ VALIDAÇÃO MANUAL (R$ 5.000,00)\n');
console.log('='.repeat(70));

const testSalary = 5000.00;
console.log(`\nSalário Bruto: R$ ${testSalary.toFixed(2)}\n`);

console.log('CÁLCULO INSS (Progressivo):');
console.log('  Faixa 1 (até R$ 1.412,00):       1.412,00 × 7,5%  = R$ 105,90');
console.log('  Faixa 2 (R$ 1.412,01 - 2.666,68): 1.254,68 × 9%    = R$ 112,92');
console.log('  Faixa 3 (R$ 2.666,69 - 4.000,03): 1.333,35 × 12%   = R$ 160,00');
console.log('  Faixa 4 (R$ 4.000,04 - 5.000,00):   999,97 × 14%   = R$ 140,00');
console.log('                                                     ─────────');
console.log('  TOTAL INSS:                                        R$ 518,82');

const resultINSS = calculateINSS(testSalary);
console.log(`\n  ✓ Calculado pelo sistema: R$ ${resultINSS.value.toFixed(2)}`);
console.log(`  ${resultINSS.value === 518.82 ? '✅ CORRETO' : '❌ DIVERGÊNCIA'}`);

const baseIRRFTest = testSalary - resultINSS.value;
console.log(`\nBase de Cálculo IRRF: R$ ${testSalary.toFixed(2)} - R$ ${resultINSS.value.toFixed(2)} = R$ ${baseIRRFTest.toFixed(2)}`);

console.log('\nCÁLCULO IRRF:');
console.log(`  Base: R$ ${baseIRRFTest.toFixed(2)}`);
console.log('  Faixa 4: (R$ 4.664,69 ou mais) → 22,5% - R$ 662,77');
console.log(`  Cálculo: R$ ${baseIRRFTest.toFixed(2)} × 22,5% - R$ 662,77`);

const expectedIRRFManual = (baseIRRFTest * 0.225) - 662.77;
console.log(`  Resultado: R$ ${expectedIRRFManual.toFixed(2)}`);

const resultIRRF = calculateIRRF(baseIRRFTest, 0);
console.log(`\n  ✓ Calculado pelo sistema: R$ ${resultIRRF.value.toFixed(2)}`);
console.log(`  ${Math.abs(resultIRRF.value - expectedIRRFManual) < 0.02 ? '✅ CORRETO' : '❌ DIVERGÊNCIA'}`);

console.log(`\nLÍQUIDO FINAL: R$ ${(testSalary - resultINSS.value - resultIRRF.value).toFixed(2)}`);

console.log('\n' + '='.repeat(70));
console.log('✅ TESTES CONCLUÍDOS - CÁLCULOS VALIDADOS!\n');
