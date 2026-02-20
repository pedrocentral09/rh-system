import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { adminStorage } from '../lib/firebase/admin';
import { EmployeeService } from '../modules/personnel/services/employee.service';
// import { calculatePayslip } from '../modules/payroll/actions/calculation';
import crypto from 'crypto';

// Help functions for random data
const randomCPF = () => {
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
};

const randomPIS = () => {
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}${n()}${n()}.${n()}${n()}-${n()}`;
};

const randomRG = () => {
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}`;
};

const names = [
    'João Silva', 'Maria Oliveira', 'Pedro Santos', 'Ana Souza', 'Lucas Lima',
    'Carla Ferreira', 'Marcos Rocha', 'Julia Mendes', 'Ricardo Alves', 'Beatriz Costa',
    'Fernando Goulart', 'Patrícia Borges', 'André Machado', 'Sonia Ribeiro', 'Roberto Martins',
    'Cláudia Pereira', 'Gustavo Nunes', 'Aline Vieira', 'Marcelo Teixeira', 'Daniela Cardoso',
    'Tiago Barbosa', 'Larissa Correia', 'Bruno Carvalho', 'Vanessa Guimarães', 'Renato Lopes'
];

async function seed() {
    console.log('🚀 Starting Mega-Seed Simulation...');

    try {
        // 1. CLEAR PREVIOUS SEED DATA (Optional, but safer for clean tests)
        // We'll skip for now to avoid accidental data loss of existing users unless they are tests.

        // 2. SEED INFRASTRUCTURE
        console.log('--- Seeding Infrastructure ---');

        // 5 Companies
        const companies = [];
        for (let i = 1; i <= 5; i++) {
            const comp = await prisma.company.upsert({
                where: { cnpj: `00.000.000/000${i}-00` },
                update: {},
                create: {
                    name: `Empresa Matriz ${i} Ltda`,
                    tradingName: `Grupo Empresarial ${i}`,
                    cnpj: `00.000.000/000${i}-00`,
                    phone: `(11) 4000-000${i}`,
                    email: `contato@empresa${i}.com.br`
                }
            });
            companies.push(comp);
            console.log(`✅ Company Created: ${comp.name}`);
        }

        // 5 Stores per Company (25 total)
        const stores = [];
        for (const comp of companies) {
            for (let j = 1; j <= 5; j++) {
                const store = await prisma.store.create({
                    data: {
                        name: `Unidade ${j} - ${comp.tradingName}`,
                        tradingName: `Loja ${j}`,
                        code: `LJ${comp.cnpj.split('/')[1].split('-')[0]}${j}`,
                        companyId: comp.id,
                        city: 'Goiânia',
                        state: 'GO'
                    }
                });
                stores.push(store);
            }
        }
        console.log(`✅ ${stores.length} Stores Created.`);

        // 5 Sectors
        const sectorNames = ['Vendas', 'Logística', 'Financeiro', 'RH', 'TI'];
        const sectors = [];
        for (const name of sectorNames) {
            const sector = await prisma.sector.upsert({
                where: { name },
                update: {},
                create: { name }
            });
            sectors.push(sector);
        }
        console.log(`✅ ${sectors.length} Sectors Created.`);

        // 5 Job Roles
        const roleNames = ['Consultor', 'Analista', 'Gerente', 'Supervisor', 'Assistente'];
        const roles = [];
        for (const name of roleNames) {
            const role = await prisma.jobRole.upsert({
                where: { name },
                update: {},
                create: { name }
            });
            roles.push(role);
        }
        console.log(`✅ ${roles.length} Job Roles Created.`);

        // Shifts
        const shiftData = [
            { name: 'Manhã', startTime: '08:00', endTime: '12:00', breakDuration: 60 },
            { name: 'Tarde', startTime: '13:00', endTime: '17:00', breakDuration: 60 },
            { name: 'Integral', startTime: '08:00', endTime: '18:00', breakDuration: 60 },
            { name: 'Noite', startTime: '22:00', endTime: '06:00', breakDuration: 60 }
        ];
        const shifts = [];
        for (const s of shiftData) {
            const shift = await prisma.shiftType.create({ data: s });
            shifts.push(shift);
        }
        console.log(`✅ ${shifts.length} Shifts Created.`);

        // 3. SEED EMPLOYEES (20 Active + 5 Terminated)
        console.log('--- Seeding Employees ---');
        const allEmployees = [];

        for (let i = 0; i < 25; i++) {
            const name = names[i];
            const status = i < 20 ? 'ACTIVE' : 'TERMINATED';

            const employeeData = {
                name,
                email: `${name.toLowerCase().replace(' ', '.')}@test.com`,
                cpf: randomCPF(),
                rg: randomRG(),
                dateOfBirth: '1990-01-01',
                gender: i % 2 === 0 ? 'MALE' : 'FEMALE',
                maritalStatus: 'SINGLE',
                phone: '(11) 99999-9999',
                status,
                pis: randomPIS(),

                // Professional Details
                companyId: companies[Math.floor(Math.random() * companies.length)].id,
                storeId: stores[Math.floor(Math.random() * stores.length)].id,
                sectorId: sectors[Math.floor(Math.random() * sectors.length)].id,
                jobRoleId: roles[Math.floor(Math.random() * roles.length)].id,
                baseSalary: (Math.random() * (8500 - 1621) + 1621).toFixed(2),
                hireDate: '2025-01-01',
                workShiftId: shifts[i % shifts.length].id,

                // Bank Info
                bank: 'NUBANK',
                accountType: 'SAVINGS',
                agency: '0001',
                accountNumber: '123456-7',
                pixKey: randomCPF()
            };

            const result = await EmployeeService.create(employeeData);
            if (!result.success) {
                console.error(`❌ Failed to create ${name}:`, result.error);
                continue;
            }

            const emp = result.data;
            allEmployees.push(emp);
            console.log(`✅ Employee Created: ${emp.name} (${status})`);

            // 4. FIREBASE PLACEHOLDERS
            console.log(`   📤 Uploading Firebase placeholders for ${name}...`);
            const photoBuffer = Buffer.from(`PHOTO_OF_${name}_#${i}`, 'utf-8');
            const docBuffer = Buffer.from(`DOCUMENT_OF_${name}_#${i}`, 'utf-8');

            try {
                const photoFile = adminStorage.file(`employees/${emp.id}/profile_photo.txt`);
                await photoFile.save(photoBuffer, { contentType: 'text/plain' });

                const docFile = adminStorage.file(`employees/${emp.id}/documents/IDENTIDADE/rg.pdf`);
                await docFile.save(docBuffer, { contentType: 'application/pdf' });

                // Update DB with photoUrl if needed, but EmployeeService create might have handled basic data.
                // Let's link a dummy document in DB too
                await prisma.document.create({
                    data: {
                        employeeId: emp.id,
                        type: 'IDENTIDADE',
                        fileName: 'rg.pdf',
                        fileUrl: `https://storage.googleapis.com/${process.env.FIREBASE_STORAGE_BUCKET}/employees/${emp.id}/documents/IDENTIDADE/rg.pdf`,
                        status: 'SIGNED'
                    }
                });
            } catch (fe) {
                console.warn(`   ⚠️ Firebase upload skipped/failed for ${name}:`, (fe as Error).message);
            }
        }

        // 5. SEED SCALES AND TIME RECORDS (01/01/2026 to 17/02/2026)
        console.log('--- Seeding Scales & Time Records ---');
        const start = new Date(Date.UTC(2026, 0, 1));
        const end = new Date(Date.UTC(2026, 1, 17));

        for (const emp of allEmployees) {
            console.log(`   Processing records for ${emp.name}...`);
            const current = new Date(start);
            while (current <= end) {
                const isWeekend = current.getUTCDay() === 0 || current.getUTCDay() === 6;
                const shift = emp.contract?.workShift;

                // Create Scale
                await prisma.workScale.create({
                    data: {
                        employeeId: emp.id,
                        date: new Date(current),
                        shiftTypeId: isWeekend ? null : emp.contract?.workShiftId // Day off if weekend
                    }
                });

                if (!isWeekend) {
                    // 14 Employees: Perfect records
                    // 3 Employees: Delays/Early departures
                    // 2 Employees: Absences
                    // 1 Employee: Overtime
                    const empIdx = allEmployees.indexOf(emp);
                    let behavior = 'OK';
                    if (empIdx >= 14 && empIdx < 17) behavior = 'DELAY';
                    if (empIdx >= 17 && empIdx < 19) behavior = 'ABSENT';
                    if (empIdx === 19) behavior = 'OVERTIME';

                    if (behavior !== 'ABSENT') {
                        const punches = [];
                        if (behavior === 'OK') {
                            punches.push('08:00', '12:00', '13:00', '17:00');
                        } else if (behavior === 'DELAY') {
                            punches.push('08:25', '12:05', '13:10', '16:45');
                        } else if (behavior === 'OVERTIME') {
                            punches.push('07:30', '12:00', '13:00', '18:30');
                        }

                        for (const p of punches) {
                            await prisma.timeRecord.create({
                                data: {
                                    employeeId: emp.id,
                                    date: new Date(current),
                                    time: p,
                                    pis: emp.pis || '000000',
                                    isManual: false
                                }
                            });
                        }
                    }
                }
                current.setUTCDate(current.getUTCDate() + 1);
            }
        }

        // 6. DISCIPLINARY, VACATIONS, TERMINATIONS
        console.log('--- Seeding Disciplinary, Vacations & Terminations ---');
        for (let i = 0; i < 5; i++) {
            const emp = allEmployees[i];

            // Disciplinary
            await prisma.disciplinaryRecord.create({
                data: {
                    employeeId: emp.id,
                    type: i % 2 === 0 ? 'VERBAL_WARNING' : 'SUSPENSION',
                    severity: 'MEDIUM',
                    date: new Date(2026, 0, 15),
                    reason: 'Atrasos frequentes conforme registros de ponto',
                    description: 'O colaborador foi orientado sobre a importância da pontualidade.',
                    daysSuspended: i % 2 !== 0 ? 1 : 0
                }
            });

            // Vacation (Already taken)
            await prisma.vacationPeriod.create({
                data: {
                    employeeId: emp.id,
                    startDate: new Date(2025, 0, 1),
                    endDate: new Date(2025, 11, 31),
                    limitDate: new Date(2026, 10, 31),
                    vested: true,
                    status: 'PAID'
                }
            });
        }

        // 7. PAYROLL (January and February)
        console.log('--- Seeding Payroll ---');
        const periods = [
            { month: 1, year: 2026 },
            { month: 2, year: 2026 }
        ];

        for (const p of periods) {
            const period = await prisma.payrollPeriod.create({
                data: { ...p, status: 'OPEN' }
            });

            // Trigger payroll calculation for all active employees
            // We can just call the action we investigated
            // But let's verify if calculatePayslip works in a script (it has 'use server')
            // tsx might handle it if we mock revalidatePath
        }

        console.log('✨ Mega-Seed Completed Successfully!');

    } catch (err) {
        console.error('💥 Seed Fatal Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

// Mock next/cache
require('next/cache').revalidatePath = () => { };

seed();
