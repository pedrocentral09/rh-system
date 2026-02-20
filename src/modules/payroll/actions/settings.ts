
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Busca as configurações globais da folha
 */
export async function getPayrollSettings() {
    const version = 'v3.1-sql-snake';
    try {
        console.log(`[DEBUG] getPayrollSettings [${version}]: Starting...`);
        const p = prisma as any;
        let settings: any = null;

        // Try standard Prisma first
        if (p.payrollSettings) {
            try {
                settings = await p.payrollSettings.findUnique({ where: { id: 'default' } });
                if (settings) console.log(`[DEBUG] getPayrollSettings [${version}]: Found via Prisma`);
            } catch (e) {
                console.error(`[DEBUG] getPayrollSettings [${version}]: Prisma path failed`, e);
            }
        }

        // Fallback to RAW SQL if not found or prisma path failed
        if (!settings) {
            console.warn(`[DEBUG] getPayrollSettings [${version}]: Falling back to RAW SQL...`);
            try {
                // Try quoted lowercase table name (PostgreSQL default snake_case with map)
                const result: any[] = await prisma.$queryRawUnsafe(
                    'SELECT * FROM "payroll_settings" WHERE id = \'default\' LIMIT 1'
                );
                settings = result && result.length > 0 ? result[0] : null;

                if (!settings) {
                    // Try without quotes for the table
                    const result2: any[] = await prisma.$queryRawUnsafe(
                        'SELECT * FROM payroll_settings WHERE id = \'default\' LIMIT 1'
                    );
                    settings = result2 && result2.length > 0 ? result2[0] : null;
                }
            } catch (sqlErr: any) {
                console.error(`[DEBUG] getPayrollSettings [${version}]: RAW SQL failed`, sqlErr.message);
            }
        }

        // Mapping to avoid camelCase/snake_case issues
        if (settings) {
            const mapped = {
                id: settings.id,
                minimumWage: Number(settings.minimum_wage || settings.minimumWage || 1412.00),
                familySalaryLimit: Number(settings.family_salary_limit || settings.familySalaryLimit || 1819.26),
                familySalaryValue: Number(settings.family_salary_value || settings.familySalaryValue || 62.04),
                updatedAt: settings.updatedAt || settings.updated_at || new Date().toISOString()
            };
            return { success: true, data: mapped };
        }

        // EXTREME FALLBACK: Return defaults if database is completely inaccessible
        console.error(`[DEBUG] getPayrollSettings [${version}]: TOTAL FAILURE. Returning defaults.`);
        return {
            success: true,
            data: {
                id: 'default',
                minimumWage: 1412.00,
                familySalaryLimit: 1819.26,
                familySalaryValue: 62.04,
                isFallback: true // Flag to show it's a fallback
            }
        };
    } catch (error: any) {
        console.error(`[DEBUG] getPayrollSettings [${version}]: Critical Catch`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Atualiza as configurações globais da folha
 */
export async function updatePayrollSettings(data: {
    minimumWage: number;
    familySalaryLimit: number;
    familySalaryValue: number;
}) {
    try {
        await prisma.payrollSettings.update({
            where: { id: 'default' },
            data: {
                minimumWage: data.minimumWage,
                familySalaryLimit: data.familySalaryLimit,
                familySalaryValue: data.familySalaryValue
            }
        });

        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        console.error('Error updating payroll settings:', error);
        return { success: false, error: 'Failed to update settings' };
    }
}

/**
 * Busca tabelas de impostos (INSS ou IRRF) por ano
 */
export async function getTaxTable(name: string, year: number = 2024) {
    try {
        const p = prisma as any;
        let table: any = null;

        if (p.taxTable) {
            table = await p.taxTable.findUnique({
                where: { name_year: { name, year } },
                include: {
                    brackets: {
                        orderBy: { order: 'asc' }
                    }
                }
            });
        } else {
            console.warn(`[DEBUG] prisma.taxTable missing. Falling back to $queryRaw for ${name}...`);
            const tables: any[] = await prisma.$queryRawUnsafe(
                `SELECT * FROM "payroll_tax_tables" WHERE name = '${name}' AND year = ${year} LIMIT 1`
            );
            table = tables && tables.length > 0 ? tables[0] : null;

            if (table) {
                table.brackets = await prisma.$queryRawUnsafe(
                    `SELECT * FROM "payroll_tax_brackets" WHERE "tableId" = '${table.id}' ORDER BY "order" ASC`
                );
            }
        }

        if (!table) return { success: true, data: null };

        return {
            success: true,
            data: {
                ...table,
                brackets: table.brackets.map((b: any) => ({
                    ...b,
                    limit: Number(b.limit),
                    rate: Number(b.rate),
                    deduction: Number(b.deduction)
                }))
            }
        };
    } catch (error) {
        console.error(`Error fetching tax table ${name}:`, error);
        return { success: false, error: `Failed to fetch ${name} table` };
    }
}

/**
 * Atualiza ou cria rubricas em uma tabela de impostos
 */
export async function updateTaxTable(name: string, year: number, brackets: any[]) {
    try {
        const p = prisma as any;

        if (p.taxTable && p.taxBracket) {
            await prisma.$transaction(async (tx: any) => {
                const table = await tx.taxTable.upsert({
                    where: { name_year: { name, year } },
                    update: {},
                    create: { name, year }
                });

                await tx.taxBracket.deleteMany({
                    where: { tableId: table.id }
                });

                for (let i = 0; i < brackets.length; i++) {
                    await tx.taxBracket.create({
                        data: {
                            tableId: table.id,
                            limit: brackets[i].limit,
                            rate: brackets[i].rate,
                            deduction: brackets[i].deduction || 0,
                            order: i + 1
                        }
                    });
                }
            });
        } else {
            console.warn(`[DEBUG] prisma.taxTable/taxBracket missing. Falling back to RAW SQL for ${name}...`);
            await prisma.$transaction(async (tx) => {
                // Upsert TaxTable
                const existingTables: any[] = await tx.$queryRawUnsafe(
                    `SELECT id FROM "payroll_tax_tables" WHERE name = '${name}' AND year = ${year} LIMIT 1`
                );

                let tableId: string;
                if (existingTables && existingTables.length > 0) {
                    tableId = existingTables[0].id;
                } else {
                    tableId = `table-${name}-${year}`;
                    await tx.$executeRawUnsafe(
                        `INSERT INTO "payroll_tax_tables" (id, name, year) VALUES ('${tableId}', '${name}', ${year})`
                    );
                }

                // Delete brackets
                await tx.$executeRawUnsafe(`DELETE FROM "payroll_tax_brackets" WHERE "tableId" = '${tableId}'`);

                // Insert new brackets
                for (let i = 0; i < brackets.length; i++) {
                    const id = `bracket-${tableId}-${i}`;
                    await tx.$executeRawUnsafe(
                        `INSERT INTO "payroll_tax_brackets" (id, "tableId", "limit", rate, deduction, "order")
                         VALUES ('${id}', '${tableId}', ${brackets[i].limit}, ${brackets[i].rate}, ${brackets[i].deduction || 0}, ${i + 1})`
                    );
                }
            });
        }

        revalidatePath('/dashboard/payroll');
        return { success: true };
    } catch (error) {
        console.error(`Error updating tax table ${name}:`, error);
        return { success: false, error: `Failed to update ${name} table` };
    }
}

/**
 * Atualização Salarial em Lote (Para quem ganha o mínimo)
 */
export async function updateMinimumWageSalaries(newWage: number) {
    try {
        const p = prisma as any;
        let currentWage: number;

        if (p.payrollSettings) {
            const settings = await p.payrollSettings.findUnique({ where: { id: 'default' } });
            currentWage = settings ? Number(settings.minimumWage) : 1412.00;
        } else {
            const result: any[] = await prisma.$queryRawUnsafe('SELECT "minimumWage" FROM "payroll_settings" WHERE id = \'default\'');
            currentWage = result && result.length > 0 ? Number(result[0].minimumWage) : 1412.00;
        }

        console.log(`[Payroll] Updating salaries from R$ ${currentWage} to R$ ${newWage}...`);

        // Database-agnostic update
        const updatedCount = await prisma.$executeRawUnsafe(
            `UPDATE "personnel_contracts" SET "baseSalary" = ${newWage} WHERE "baseSalary" = ${currentWage}`
        );

        // Update settings
        if (p.payrollSettings) {
            await p.payrollSettings.update({
                where: { id: 'default' },
                data: { minimumWage: newWage }
            });
        } else {
            await prisma.$executeRawUnsafe(
                `UPDATE "payroll_settings" SET "minimumWage" = ${newWage} WHERE id = 'default'`
            );
        }

        revalidatePath('/dashboard/personnel');
        revalidatePath('/dashboard/payroll');

        return { success: true, updated: updatedCount };
    } catch (error) {
        console.error('Error in bulk salary update:', error);
        return { success: false, error: 'Failed to update salaries' };
    }
}
