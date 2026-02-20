
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const events = [
        // EARNINGS (Proventos) - 1000 to 4999
        { code: '1001', name: 'Salário Base', type: 'EARNING', description: 'Salário contratual mensal', isSystem: true },
        { code: '1002', name: 'Horas Extras 50%', type: 'EARNING', description: 'Horas trabalhadas além da jornada', isSystem: true },
        { code: '1003', name: 'Horas Extras 100%', type: 'EARNING', description: 'Horas trabalhadas em domingos/feriados', isSystem: true },
        { code: '1004', name: 'Adicional Noturno', type: 'EARNING', description: 'Trabalho entre 22h e 5h', isSystem: true },
        { code: '1005', name: 'DSR', type: 'EARNING', description: 'Descanso Semanal Remunerado sobre variáveis', isSystem: true },
        { code: '1010', name: 'Insalubridade', type: 'EARNING', description: 'Adicional por ambiente insalubre', isSystem: true },
        { code: '1011', name: 'Periculosidade', type: 'EARNING', description: 'Adicional por risco de vida', isSystem: true },
        { code: '1012', name: 'Cargo de Confiança', type: 'EARNING', description: 'Gratificação de função', isSystem: true },
        { code: '1013', name: 'Quebra de Caixa', type: 'EARNING', description: 'Gratificação para caixas', isSystem: true },
        { code: '1014', name: 'Salário Família', type: 'EARNING', description: 'Benefício cota INSS', isSystem: true },
        { code: '1020', name: 'Bônus Mensal', type: 'EARNING', description: 'Gratificações e bônus fixos', isSystem: true },

        // DEDUCTIONS (Descontos) - 5000 to 8999
        { code: '5001', name: 'INSS', type: 'DEDUCTION', description: 'Contribuição Previdenciária', isSystem: true },
        { code: '5002', name: 'IRRF', type: 'DEDUCTION', description: 'Imposto de Renda Retido na Fonte', isSystem: true },
        { code: '6001', name: 'Vale Transporte (Desc)', type: 'DEDUCTION', description: 'Desconto legal de até 6%', isSystem: true },
        { code: '6002', name: 'Vale Alimentação (Desc)', type: 'DEDUCTION', description: 'Participação do funcionário no VA', isSystem: true },
        { code: '6003', name: 'Vale Refeição (Desc)', type: 'DEDUCTION', description: 'Participação do funcionário no VR', isSystem: true },
        { code: '6004', name: 'Faltas Injustificadas', type: 'DEDUCTION', description: 'Ausências não abonadas', isSystem: true },
        { code: '6005', name: 'DSR s/ Faltas', type: 'DEDUCTION', description: 'Dedo duro do DSR sobre faltas', isSystem: true },
        { code: '6006', name: 'Atrasos', type: 'DEDUCTION', description: 'Desconto por atraso', isSystem: true },
        { code: '6010', name: 'Adiantamento Salarial', type: 'DEDUCTION', description: 'Desconto de adiantamento (Vale)', isSystem: true },
    ];

    console.log('🌱 Seeding Payroll Events...');

    for (const evt of events) {
        await prisma.payrollEvent.upsert({
            where: { code: evt.code },
            update: evt,
            create: evt,
        });
    }

    console.log('✅ Payroll Events Seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
