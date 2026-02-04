import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // 0. Update employees with fake PIS if missing (needed for matching)
    const employees = await prisma.employee.findMany();
    console.log(`Found ${employees.length} employees.`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Scenarios
    const scenarios = [
        ['08:00', '12:00', '13:00', '17:48'], // OK (Standard 8h48 approx)
        ['08:15', '12:00', '13:00', '17:48'], // Delay (Late entry)
        ['08:00', '12:00', '13:00', '17:00'], // Delay (Early exit)
        ['08:00', '12:00'],                   // Missing (Forgot return)
        ['08:00', '12:00', '13:00', '19:00'], // Extra (Overtime)
        []                                    // Absent
    ];

    console.log(`Seeding punches for date: ${today.toLocaleDateString()}`);

    // Idempotency: Clear existing records for this day first
    await prisma.timeRecord.deleteMany({
        where: { date: today }
    });
    console.log('Cleared existing records for today.');

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];

        // Assign a mock PIS if empty so logic works
        if (!emp.pis) {
            await prisma.employee.update({
                where: { id: emp.id },
                data: { pis: `123456789${i.toString().padStart(2, '0')}` }
            });
        }

        // Pick a scenario (cycle through)
        const punches = scenarios[i % scenarios.length];

        if (punches.length > 0) {
            await prisma.timeRecord.createMany({
                data: punches.map(time => ({
                    date: today,
                    time: time,
                    employeeId: emp.id,
                    pis: emp.pis || 'MOCK',
                    isManual: true, // "Simulated"
                    justification: 'Simulação Inicial'
                }))
            });
        }
    }

    console.log('✅ Simulated punches seeded for today!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
