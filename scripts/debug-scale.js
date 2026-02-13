
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function main() {
    console.log('--- 🧪 DEBUGGING WORK SCALE CREATION ---');

    // 1. Get an employee
    const emp = await prisma.employee.findFirst({
        where: { status: 'ACTIVE' }
    });

    if (!emp) {
        console.error('❌ No active employee found for testing.');
        return;
    }
    console.log(`Using Employee: ${emp.name} (${emp.id})`);

    // 2. Try to save a scale for Today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log(`Setting scale for: ${today.toISOString()}`);

    try {
        // Mocking saveWorkScale logic
        const shiftTypeId = null; // Folga

        const result = await prisma.workScale.upsert({
            where: {
                employeeId_date: {
                    employeeId: emp.id,
                    date: today
                }
            },
            create: {
                employeeId: emp.id,
                date: today,
                shiftTypeId
            },
            update: {
                shiftTypeId
            }
        });

        console.log('✅ Upsert successful:', result);

        // Try another one with same date but different time
        // Test 3: Empty string as shiftTypeId (Potential bug)
        console.log('\n--- Test 3: Empty string as shiftTypeId ---');
        try {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            await prisma.workScale.create({
                data: {
                    employeeId: emp.id,
                    date: tomorrow,
                    shiftTypeId: "" // Empty string
                }
            });
            console.log('✅ Created with empty string? (Unexpected)');
        } catch (e) {
            console.log('❌ Caught expected error for empty string:', e.message);
        }

        const todayAtNoon = new Date(today);
        todayAtNoon.setHours(12, 0, 0, 0);
        console.log(`\nSetting scale for same day but different time: ${todayAtNoon.toISOString()}`);

        const result2 = await prisma.workScale.upsert({
            where: {
                employeeId_date: {
                    employeeId: emp.id,
                    date: todayAtNoon
                }
            },
            create: {
                employeeId: emp.id,
                date: todayAtNoon,
                shiftTypeId
            },
            update: {
                shiftTypeId
            }
        });
        console.log('✅ Second upsert successful (This confirms time matters in the unique key):', result2);

        const count = await prisma.workScale.count({
            where: { employeeId: emp.id }
        });
        console.log(`Total scales for employee: ${count}`);

    } catch (e) {
        console.error('❌ ERROR DURING SCALE SAVE:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
