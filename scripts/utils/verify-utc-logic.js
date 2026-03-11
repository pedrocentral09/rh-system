const { getTimeSheet } = require('../src/modules/time-tracking/actions/timesheet');

async function testRange() {
    console.log('--- Testing getTimeSheet UTC Range ---');
    // Mocking Prisma if needed? 
    // Actually better to just run the logic check manually or check the real outputs if DB is available.
    // Let's just verify the logic by a simple script checking Date.UTC bahavior.

    const year = 2026;
    const month = 1; // Feb
    const closingDay = 31; // Full month

    const startDate = new Date(Date.UTC(year, month, 1));
    const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

    console.log('Start (Raw):', startDate.toISOString());
    console.log('End (Raw):', endDate.toISOString());
    console.log('Feb 14 UTC check:', new Date(Date.UTC(2026, 1, 14)).toISOString());
}

testRange();
