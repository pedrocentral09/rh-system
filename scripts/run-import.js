const xlsx = require('xlsx');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function excelDateToJSDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const utcDays = Math.floor(serial - 25569);
    const d = new Date(utcDays * 86400 * 1000);
    return d;
}

function fmtDate(d) {
    if (!d) return null;
    return d.toISOString();
}

async function main() {
    const wb = xlsx.readFile('importar.xlsx');
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(ws);

    console.log(`Total de linhas encontradas: ${rows.length}`);

    let successCount = 0;
    let errorCount = 0;

    for (const row of rows) {
        try {
            const name = (row['NOME'] || '').trim();
            if (!name) { errorCount++; continue; }

            const status = (row['SITUAÇÃO'] || 'ATIVO').toUpperCase().includes('ATIVO') ? 'ACTIVE' : 'TERMINATED';
            const dateOfBirth = excelDateToJSDate(row['NASCIMENTO']);
            const admissionDate = excelDateToJSDate(row['ADMISSÃO']);
            const ctps = row['CTPS'] || null;
            const phone = row['CONTATO'] ? String(row['CONTATO']) : (row['TELEFONE'] ? String(row['TELEFONE']) : null);
            const salaryRaw = row[' SALÁRIO BASE '] || row['SALÁRIO BASE'] || 0;
            const salary = typeof salaryRaw === 'number' ? salaryRaw : parseFloat(String(salaryRaw).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;

            const jobTitleRaw = (row['CARGO'] || '').trim();
            const departmentRaw = (row['SETOR'] || '').trim();

            // Auto-create Sector via raw SQL upsert
            let sectorId = null;
            if (departmentRaw) {
                const existing = await prisma.$queryRawUnsafe(
                    `SELECT id FROM config_sectors WHERE name = $1 LIMIT 1`, departmentRaw
                );
                if (existing.length > 0) {
                    sectorId = existing[0].id;
                } else {
                    const created = await prisma.$queryRawUnsafe(
                        `INSERT INTO config_sectors (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, now(), now()) RETURNING id`,
                        departmentRaw
                    );
                    sectorId = created[0].id;
                }
            }

            // Auto-create JobRole via raw SQL upsert
            let jobRoleId = null;
            if (jobTitleRaw) {
                const existing = await prisma.$queryRawUnsafe(
                    `SELECT id FROM config_job_roles WHERE name = $1 LIMIT 1`, jobTitleRaw
                );
                if (existing.length > 0) {
                    jobRoleId = existing[0].id;
                } else {
                    const created = await prisma.$queryRawUnsafe(
                        `INSERT INTO config_job_roles (id, name, "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, now(), now()) RETURNING id`,
                        jobTitleRaw
                    );
                    jobRoleId = created[0].id;
                }
            }

            // Insert Employee via raw SQL
            const empResult = await prisma.$queryRawUnsafe(`
                INSERT INTO personnel_employees 
                    (id, name, status, "isIncomplete", "dateOfBirth", ctps, phone, "jobTitle", department, "jobRoleId", "createdAt", "updatedAt")
                VALUES 
                    (gen_random_uuid(), $1, $2, true, $3, $4, $5, $6, $7, $8, now(), now())
                RETURNING id
            `, name, status, dateOfBirth, ctps, phone, jobTitleRaw || null, departmentRaw || null, jobRoleId);

            const employeeId = empResult[0].id;

            // Insert Contract via raw SQL
            if (sectorId || jobRoleId || salary > 0 || admissionDate) {
                await prisma.$queryRawUnsafe(`
                    INSERT INTO personnel_contracts 
                        (id, "employeeId", "sectorId", sector, "jobRoleId", "baseSalary", "contractType", "admissionDate")
                    VALUES 
                        (gen_random_uuid(), $1, $2, $3, $4, $5, 'CLT', $6)
                `, employeeId, sectorId, departmentRaw || 'Geral', jobRoleId, salary, admissionDate || new Date());
            }

            successCount++;
            process.stdout.write(`✅ ${name}\n`);
        } catch (e) {
            errorCount++;
            console.error(`❌ Erro em "${row['NOME'] || '?'}":`, e.message);
        }
    }

    console.log(`\n===== RESULTADO =====`);
    console.log(`Importados: ${successCount}`);
    console.log(`Erros: ${errorCount}`);

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
