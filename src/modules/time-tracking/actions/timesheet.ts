'use server';

import { prisma } from '@/lib/prisma';
import { calculateDay } from '../services/calculation';

export async function getTimeSheet(employeeId: string, month: number, year: number) {
    try {
        // 0. Fetch Company Settings for Closing Day
        // Using raw prisma query for speed avoiding full getCompanySettings overhead/import cycles ideally
        const setting = await prisma.companySettings.findUnique({ where: { key: 'COMPANY_PROFILE' } });
        let closingDay = 31;
        if (setting?.value) {
            try {
                const parsed = JSON.parse(setting.value);
                closingDay = Number(parsed.closingDay) || 31;
            } catch { } // Default 31
        }

        // 1. Calculate Date Range (UTC Midnights)
        let startDate: Date;
        let endDate: Date;

        if (closingDay >= 28) {
            // Standard Full Month (1 to 30/31)
            startDate = new Date(Date.UTC(year, month, 1));
            endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // End of last day
        } else {
            // Split Month (e.g. 21st Jan to 20th Feb)
            startDate = new Date(Date.UTC(year, month - 1, closingDay + 1));
            endDate = new Date(Date.UTC(year, month, closingDay, 23, 59, 59, 999));
        }

        // 1.5 Fetch Holidays for the period
        const holidays = await prisma.holiday.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        // 2. Fetch all records for the period
        const records = await prisma.timeRecord.findMany({
            where: {
                employeeId: employeeId,
                date: { gte: startDate, lte: endDate }
            },
            orderBy: { time: 'asc' }
        });

        // 3. Fetch all scales for the period
        const scales = await prisma.workScale.findMany({
            where: {
                employeeId: employeeId,
                date: { gte: startDate, lte: endDate }
            },
            include: { shiftType: true }
        });

        // 4. Process every day in the range
        const sheet = [];

        // Loop from Start to End Date using UTC
        const current = new Date(startDate);
        while (current <= endDate) {
            const loopDate = new Date(current); // This is already a UTC date object
            const dayNum = loopDate.getUTCDate();
            const monthNum = loopDate.getUTCMonth();

            // Filter pre-fetched data using UTC methods
            const dayRecords = records.filter((r: { date: Date }) =>
                r.date.getUTCDate() === dayNum && r.date.getUTCMonth() === monthNum
            );
            const dayScale = scales.find((s: { date: Date }) =>
                s.date.getUTCDate() === dayNum && s.date.getUTCMonth() === monthNum
            );

            const calc = await calculateDay(employeeId, loopDate, dayRecords, dayScale, holidays);

            sheet.push({
                day: dayNum,
                ...calc
            });

            current.setUTCDate(current.getUTCDate() + 1);
        }

        // Calculate Totals (Only up to yesterday to avoid misleading daily balances)
        const now = new Date();
        const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
        const totalBalance = sheet
            .filter(day => day.date <= yesterday)
            .reduce((acc, day) => acc + day.balanceMinutes, 0);

        return { success: true, data: { days: sheet, totalBalance } };

    } catch (error) {
        console.error('Error fetching time sheet:', error);
        return { success: false, error: 'Failed to fetch time sheet' };
    }
}

export async function getDailyOverview(dateString: string, filters?: { companyId?: string, storeId?: string }) {
    try {
        // Parse "YYYY-MM-DD" explicitly to UTC Midnight
        const [y, m, d] = dateString.split('-').map(Number);
        const queryDate = new Date(Date.UTC(y, m - 1, d));

        // Prepare where clause
        const whereClause: any = { status: 'ACTIVE' };
        if (filters?.companyId) whereClause.contract = { companyId: filters.companyId };
        if (filters?.storeId) {
            whereClause.contract = { ...whereClause.contract, storeId: filters.storeId };
        }

        // Fetch all active employees matching filters
        const employees = await prisma.employee.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                department: true,
                contract: {
                    select: {
                        sectorDef: { select: { name: true } }
                    }
                }
            }
        });

        // Fetch all scales for this day
        const scales = await prisma.workScale.findMany({
            where: { date: queryDate },
            include: { shiftType: true }
        });

        // Fetch all records for this day
        const records = await prisma.timeRecord.findMany({
            where: { date: queryDate },
            orderBy: { time: 'asc' }
        });

        // Fetch holidays for this specific day
        const holidays = await prisma.holiday.findMany({
            where: { date: queryDate }
        });

        // Calculate for each employee
        const overview = [];
        for (const emp of employees) {
            const empScale = scales.find((s: { employeeId: string }) => s.employeeId === emp.id);
            const empRecords = records.filter((r: { employeeId: string | null }) => r.employeeId === emp.id);

            const calc = await calculateDay(emp.id, queryDate, empRecords, empScale, holidays);

            overview.push({
                employee: { id: emp.id, name: emp.name, department: (emp as any).contract?.sectorDef?.name || emp.department },
                ...calc
            });
        }

        // Sort by status priority (Absent/Delay first)
        const priority = { 'ABSENT': 0, 'DELAY': 1, 'MISSING': 2, 'EXTRA': 3, 'OK': 4, 'DAY_OFF': 5 };
        overview.sort((a, b) => (priority[a.status] || 99) - (priority[b.status] || 99));

        return { success: true, data: overview };
    } catch (error) {
        console.error('Error daily overview:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function getBankOverview(month: number, year: number) {
    try {
        // 0. Fetch Company Settings
        const setting = await prisma.companySettings.findUnique({ where: { key: 'COMPANY_PROFILE' } });
        let closingDay = 31;
        if (setting?.value) {
            try {
                const parsed = JSON.parse(setting.value);
                closingDay = Number(parsed.closingDay) || 31;
            } catch { }
        }

        // 1. Calculate Date Range
        let startDate: Date; // Start of period
        let endDate: Date;   // End of period (usually today or end of cycle)

        if (closingDay >= 28) {
            startDate = new Date(Date.UTC(year, month, 1));
            endDate = new Date(Date.UTC(year, month + 1, 0));
        } else {
            startDate = new Date(Date.UTC(year, month - 1, closingDay + 1));
            endDate = new Date(Date.UTC(year, month, closingDay));
        }

        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true, name: true, department: true }
        });

        const bankList = [];

        // Optimization: Fetch all records/scales for month in one go
        const allRecords = await prisma.timeRecord.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });
        const allScales = await prisma.workScale.findMany({
            where: { date: { gte: startDate, lte: endDate } },
            include: { shiftType: true }
        });
        const holidays = await prisma.holiday.findMany({
            where: { date: { gte: startDate, lte: endDate } }
        });

        for (const emp of employees) {
            let balance = 0;
            // Iterate days
            // We loop from startDate up to endDate
            // But if endDate is in future, we stop at today?
            // "Bank Balance" typically includes "Accrued" balance.
            // If today is 15th, and cycle ends 20th, do we count 16-20 as 0 or ignore?
            // Usually we ignore future days.

            const now = new Date();
            const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
            const realEndDate = (endDate > yesterday) ? yesterday : endDate;

            const current = new Date(startDate);
            while (current <= realEndDate) {
                // Check if actually future (ignoring time) in UTC
                if (current.getTime() > Date.now()) break;

                const dayNum = current.getDate();
                // Filter by date object comparison or compatible day/month check
                // Since `current` iterates correctly, we can strict match ISO date string prefix?
                // Or just filter by time check.

                const dayRecords = allRecords.filter(r => r.employeeId === emp.id && r.date.getTime() === current.getTime());
                // Note: getTime() comparison requires exact midnight match. 
                // Our dates are usually midnight. If not, this is risky.
                // Safest is to match Date/Month/Year.

                // Let's rely on standard loop match
                // const empScale = allScales.find(s => s.employeeId === emp.id && s.date.getDate() === dayNum); 
                // CAUTION: date.getDate() matches day number only. If cycle spans months (Jan 21 - Feb 20),
                // checking only `getDate` is wrong because Jan 21 and Feb 21 are different.

                // Fix: Filter by comparing date objects or full parts.
                const isSameDayUTC = (d1: Date, d2: Date) =>
                    d1.getUTCDate() === d2.getUTCDate() &&
                    d1.getUTCMonth() === d2.getUTCMonth() &&
                    d1.getUTCFullYear() === d2.getUTCFullYear();

                const empScale = allScales.find((s: { employeeId: string; date: Date }) => s.employeeId === emp.id && isSameDayUTC(s.date, current));
                const empRecords = allRecords.filter((r: { employeeId: string | null; date: Date }) => r.employeeId === emp.id && isSameDayUTC(r.date, current));

                const calc = await calculateDay(emp.id, new Date(current), empRecords, empScale, holidays);
                balance += calc.balanceMinutes;

                current.setUTCDate(current.getUTCDate() + 1);
            }

            bankList.push({
                employee: emp,
                balance
            });
        }

        return { success: true, data: bankList.sort((a, b) => a.balance - b.balance) };

    } catch (error) {
        console.error('Error bank overview:', error);
        return { success: false, error: 'Failed' };
    }
}

export async function adjustTimeRecords(employeeId: string, dateString: string, punches: string[], justification: string) {
    try {
        // Ensure date is start of day (Local)
        const [y, m, d] = dateString.split('-').map(Number);
        const queryDate = new Date(Date.UTC(y, m - 1, d));

        // Fetch employee to get PIS (needed for TimeRecord) or just use empty if manual
        const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
        if (!emp) throw new Error('Employee not found');

        // Transaction: Delete old records for day -> Insert new ones
        await prisma.$transaction(async (tx: any) => {
            // 1. Delete existing records for this employee on this day
            // (Both file-based and manual, effectively overwriting)
            await tx.timeRecord.deleteMany({
                where: {
                    employeeId: employeeId,
                    date: queryDate
                }
            });

            // 2. Insert new records
            if (punches.length > 0) {
                await tx.timeRecord.createMany({
                    data: punches.map(time => ({
                        date: queryDate,
                        time: time,
                        employeeId: employeeId,
                        pis: emp.pis || emp.cpf || 'MANUAL', // Fallback
                        isManual: true,
                        justification: justification,
                        fileId: null
                    }))
                });
            }
        });

        // Revalidate
        // Note: we can't easily revalidate specific paths from here without import
        // But the UI will likely reload data
        return { success: true };

    } catch (error) {
        console.error('Error adjusting time records:', error);
        return { success: false, error: 'Failed' };
    }
}
