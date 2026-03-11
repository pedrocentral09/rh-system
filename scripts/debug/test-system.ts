import { prisma } from '../src/lib/prisma';
import { EmployeeService } from '../src/modules/personnel/services/employee.service';
import { StatsService } from '../src/modules/core/services/stats.service';
import { signDocument } from '../src/modules/personnel/actions/signatures';

async function runTests() {
    console.log('🧪 Iniciando Testes de Integridade - RH Excepcional\n');

    try {
        // 1. Setup Test Data
        console.log('Step 1: Preparando Empresas e Lojas...');
        const company = await prisma.company.upsert({
            where: { cnpj: '99.999.999/0001-99' },
            update: {},
            create: { name: 'Empresa Teste Integridade', cnpj: '99.999.999/0001-99' }
        });

        const store = await prisma.store.upsert({
            where: { id: 'test-store-id' },
            update: {},
            create: { id: 'test-store-id', name: 'Loja Teste', companyId: company.id } as any
        });

        // 2. Test Employee Creation
        console.log('Step 2: Testando EmployeeService.create...');
        const newEmp = await EmployeeService.create({
            name: 'Audit User Test',
            email: `test_${Date.now()}@rh-excepcional.com`,
            cpf: `TEST_${Date.now()}`,
            rg: '00.000.000-0',
            dateOfBirth: '1995-05-15',
            hireDate: new Date().toISOString(),
            jobTitle: 'Engenheiro de Testes',
            department: 'Qualidade',
            companyId: company.id,
            storeId: store.id,
            sector: 'QA',
            baseSalary: 10000,
            contractType: 'CLT',
            zipCode: '00000-000',
            street: 'Rua Lab',
            number: '1',
            neighborhood: 'Tech Park',
            city: 'Silicon Valley',
            state: 'SP'
        });

        if (!newEmp.success) throw new Error(`Falha na criação: ${newEmp.error?.message || newEmp.message}`);
        console.log('✅ EmployeeService.create OK');
        console.log('Data returned:', JSON.stringify(newEmp.data, null, 2));

        if (!newEmp.data?.id) throw new Error('Falha ao criar colaborador: ID não retornado');

        // 3. Test Life-Cycle (Termination)
        console.log('Step 3: Testando EmployeeService.terminate...');
        const termResult = await EmployeeService.terminate(newEmp.data.id, new Date(), 'Fim do teste de integridade');
        if (!termResult.success) throw new Error(`Falha na demissão: ${termResult.message}`);
        console.log('✅ EmployeeService.terminate OK');

        // 4. Test Digital Signature
        console.log('Step 4: Testando Assinatura Digital...');
        const doc = await prisma.document.create({
            data: {
                employeeId: newEmp.data.id,
                fileName: 'Teste_Integridade.pdf',
                fileUrl: 's3://bucket/test.pdf',
                type: 'CONTRATO'
            }
        });

        const signResult = await signDocument(doc.id, 'SYSTEM_TEST_IMAGE', {
            userAgent: 'SYSTEM_TESTER',
            pin: '123456',
            ip: '127.0.0.1'
        });
        if (!signResult.success) throw new Error(`Falha na assinatura: ${signResult.error}`);
        console.log('✅ Assinatura Digital (SHA-256) OK');

        // 5. Performance Check
        console.log('Step 5: Testando Performance do Dashboard...');
        const start = Date.now();
        const stats = await StatsService.getDashboardData();
        const end = Date.now();
        if (!stats.success) throw new Error(`Falha nas estatísticas: ${stats.message}`);
        console.log(`✅ StatsService.getDashboardData OK (${end - start}ms)`);

        console.log('\n✨ TODOS OS TESTES PASSARAM COM SUCESSO! ✨');

    } catch (error: any) {
        console.error('\n❌ ERRO DURANTE OS TESTES:');
        console.error(error.message || error);
        process.exit(1);
    }
}

runTests().finally(() => prisma.$disconnect());
