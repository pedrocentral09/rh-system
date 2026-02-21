import { prisma } from '@/lib/prisma';

export class PayrollDataProvider {
    /**
     * Busca os limites e valores vigentes para Salário Mínimo e Salário Família.
     */
    static async getSettings(): Promise<{ minimumWage: number, familySalaryLimit: number, familySalaryValue: number }> {
        const p = prisma as any;
        let settings: any = null;
        if (p.payrollSettings) {
            settings = await p.payrollSettings.findUnique({ where: { id: 'default' } });
        } else {
            const results: any[] = await prisma.$queryRawUnsafe('SELECT * FROM "payroll_settings" WHERE id = \'default\' LIMIT 1');
            settings = results && results.length > 0 ? results[0] : null;
        }

        return {
            minimumWage: settings ? Number(settings.minimumWage) : 1412.00,
            familySalaryLimit: settings ? Number(settings.familySalaryLimit) : 1819.26,
            familySalaryValue: settings ? Number(settings.familySalaryValue) : 62.04,
        };
    }

    /**
     * Busca os brackets atuais de INSS.
     */
    static async getINSSBrackets(periodYear: number): Promise<any[]> {
        const p = prisma as any;
        if (p.taxTable && p.taxBracket) {
            const table = await p.taxTable.findUnique({
                where: { name_year: { name: 'INSS', year: periodYear } },
                include: { brackets: true }
            });
            if (table?.brackets.length) return table.brackets;

            // Fallback 2024
            return await p.taxBracket.findMany({ where: { table: { name: 'INSS', year: 2024 } }, orderBy: { order: 'asc' } });
        }

        // Raw SQL Fallback
        const tables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'INSS' AND year = ${periodYear} LIMIT 1`);
        const tableId = tables?.length > 0 ? tables[0].id : null;

        if (tableId) {
            return await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${tableId}' ORDER BY "order" ASC`);
        }

        const fbTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'INSS' AND year = 2024 LIMIT 1`);
        const fbId = fbTables?.length > 0 ? fbTables[0].id : null;
        if (fbId) return await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${fbId}' ORDER BY "order" ASC`);

        return [];
    }

    /**
     * Busca os brackets atuais de IRRF.
     */
    static async getIRRFBrackets(periodYear: number): Promise<any[]> {
        const p = prisma as any;
        if (p.taxTable && p.taxBracket) {
            const table = await p.taxTable.findUnique({
                where: { name_year: { name: 'IRRF', year: periodYear } },
                include: { brackets: true }
            });
            if (table?.brackets.length) return table.brackets;

            return await p.taxBracket.findMany({ where: { table: { name: 'IRRF', year: 2024 } }, orderBy: { order: 'asc' } });
        }

        // Raw SQL Fallback
        const tables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'IRRF' AND year = ${periodYear} LIMIT 1`);
        const tableId = tables?.length > 0 ? tables[0].id : null;

        if (tableId) {
            return await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${tableId}' ORDER BY "order" ASC`);
        }

        const fbTables: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "payroll_tax_tables" WHERE name = 'IRRF' AND year = 2024 LIMIT 1`);
        const fbId = fbTables?.length > 0 ? fbTables[0].id : null;
        if (fbId) return await prisma.$queryRawUnsafe(`SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${fbId}' ORDER BY "order" ASC`);

        return [];
    }

    /**
     * Busca Adiantamentos pagos neste período.
     */
    static async getAdvances(employeeId: string, periodId: string): Promise<number> {
        const advances: any[] = await prisma.$queryRaw`
            SELECT amount FROM "payroll_salary_advances" 
            WHERE "employeeId" = ${employeeId} AND "periodId" = ${periodId} AND status = 'PAID'
            LIMIT 1
        `;
        return advances && advances.length > 0 ? Number(advances[0].amount) : 0;
    }

    /**
     * Busca parcelas de empréstimos pendentes ativas para este período.
     */
    static async getLoans(employeeId: string, periodId: string): Promise<number> {
        const loans: any[] = await prisma.$queryRaw`
            SELECT amount, id FROM "payroll_loan_installments" 
            WHERE "periodId" = ${periodId} AND status = 'PENDING' AND "loanId" IN (
                SELECT id FROM "payroll_loans" WHERE "employeeId" = ${employeeId} AND status = 'ACTIVE'
            )
            LIMIT 1
        `;
        return loans && loans.length > 0 ? Number(loans[0].amount) : 0;
    }

    /**
     * Busca dados do convênio e ferramentas (Importação ERP).
     */
    static async getExternalImports(employeeId: string, periodId: string): Promise<any[]> {
        const externalImports: any[] = await prisma.$queryRaw`
            SELECT amount, "itemCode", label FROM "payroll_external_imports" 
            WHERE "periodId" = ${periodId} AND "employeeId" = ${employeeId}
        `;
        return externalImports || [];
    }
}
