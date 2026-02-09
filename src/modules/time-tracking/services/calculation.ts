
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

interface DailyStatus {
    date: Date;
    status: 'OK' | 'MISSING' | 'DELAY' | 'EXTRA' | 'DAY_OFF' | 'ABSENT';
    statusColor: string; // Tailwind class
    expectedMinutes: number;
    workedMinutes: number;
    balanceMinutes: number; // Positive = Extra, Negative = Delay
    punches: string[];
    shiftName: string | null;
}

// Helper to parse "HH:mm" to minutes from midnight
function timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
}

export async function calculateDay(employeeId: string, date: Date, records?: any[], scale?: any): Promise<DailyStatus> {
    // 1. Get Scale (Expected)
    // If not provided, fetch it
    let dayScale = scale;
    if (!dayScale) {
        dayScale = await prisma.workScale.findUnique({
            where: {
                employeeId_date: {
                    employeeId,
                    date: date // Ensure date is Date object at midnight usually
                }
            },
            include: { shiftType: true }
        });
    }

    // 2. Get Records (Actual)
    // If not provided, fetch them
    let dayRecords = records;
    if (!dayRecords) {
        // Assume date is 00:00:00. Need to match the whole day.
        // Actually TimeRecord date is DateTime. 
        // We should query by range or exact match if stored as midnight.
        // Our parser stores date as `new Date(year, month, day)` which is 00:00 local usually.
        // Prisma stores as UTC. Let's assume passed `date` matches DB storage for now.
        dayRecords = await prisma.timeRecord.findMany({
            where: {
                employeeId,
                date: date
            },
            orderBy: { time: 'asc' }
        });
    }

    const punches = (dayRecords || []).map((r: any) => r.time);

    // 3. Determine Expectations
    let expectedMinutes = 0;
    let shiftName = null;
    let isDayOff = false;

    if (!dayScale || !dayScale.shiftType) {
        isDayOff = true; // No scale or null shift = Day Off
        shiftName = 'Folga';
    } else {
        shiftName = dayScale.shiftType.name;
        const start = timeToMinutes(dayScale.shiftType.startTime);
        const end = timeToMinutes(dayScale.shiftType.endTime);
        const breakDur = dayScale.shiftType.breakDuration || 0;

        // Handle overnight shifts? Assuming same day for MVP.
        if (end < start) {
            // Overnight (e.g. 22:00 to 06:00). 
            // (24*60 - start) + end
            expectedMinutes = ((24 * 60) - start) + end - breakDur;
        } else {
            expectedMinutes = end - start - breakDur;
        }
    }

    // 4. Calculate Worked Hours
    // Pairs: In-Out, In-Out.
    // Logic: If odd number of punches, ignore last one? Or count to now? 
    // For closed days, assume unmatched punch = error or 0. 
    // Let's use simple pairing: 1st-2nd, 3rd-4th.
    let workedMinutes = 0;

    for (let i = 0; i < punches.length; i += 2) {
        if (i + 1 < punches.length) {
            const start = timeToMinutes(punches[i]);
            const end = timeToMinutes(punches[i + 1]);
            workedMinutes += (end - start);
        }
    }

    // 5. Determine Status & Balance
    let balanceMinutes = 0;
    let status: DailyStatus['status'] = 'OK';
    let statusColor = 'bg-green-100 text-green-700';

    if (isDayOff) {
        expectedMinutes = 0;
        balanceMinutes = workedMinutes; // All worked is extra
        if (workedMinutes > 0) {
            status = 'EXTRA';
            statusColor = 'bg-blue-100 text-blue-700'; // Worked on Day Off
        } else {
            status = 'DAY_OFF';
            statusColor = 'bg-slate-100 text-slate-500';
        }
    } else {
        // Regular Work Day
        balanceMinutes = workedMinutes - expectedMinutes;
        const tolerance = 10; // 10 mins tolerance

        if (punches.length === 0) {
            status = 'ABSENT';
            statusColor = 'bg-red-100 text-red-700';
        } else if (punches.length % 2 !== 0) {
            // Odd punches (Incomplete)
            status = 'MISSING'; // Missing punch
            statusColor = 'bg-amber-100 text-amber-700';
        } else if (balanceMinutes < -tolerance) {
            status = 'DELAY';
            statusColor = 'bg-yellow-100 text-yellow-700'; // Negative balance > tolerance
        } else if (balanceMinutes > tolerance) {
            status = 'EXTRA';
            statusColor = 'bg-purple-100 text-purple-700'; // Positive balance
        } else {
            status = 'OK';
            statusColor = 'bg-green-100 text-green-700';
        }
    }

    return {
        date,
        status,
        statusColor,
        expectedMinutes,
        workedMinutes,
        balanceMinutes,
        punches,
        shiftName
    };
}
