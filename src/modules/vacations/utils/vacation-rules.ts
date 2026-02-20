import { isBefore, addDays, getDay, isAfter, startOfDay } from 'date-fns';
import { prisma } from '@/lib/prisma';
import { getHolidays } from '@/lib/holidays';

/**
 * CLT Rules and Protection Utility for Vacations
 */

export async function validateVacationRequest(
    employeeId: string,
    startDate: Date,
    daysCount: number,
    soldDays: number,
    existingRequests: any[] = []
) {
    const start = startOfDay(new Date(startDate));
    const totalDaysRequested = daysCount + soldDays;

    // 1. Minimum days check (CLT: min 5 days)
    if (daysCount < 5) {
        return { success: false, error: 'O período de gozo deve ser de no mínimo 5 dias conforme CLT.' };
    }

    // 2. Prohibit starting on weekends or holidays
    const dayOfWeek = getDay(start); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { success: false, error: 'As férias não podem se iniciar em dias de repouso semanal (Sábado ou Domingo).' };
    }

    const holidays = getHolidays(start.getFullYear());
    const isHoliday = holidays.some((h: any) => start.getTime() === startOfDay(h.date).getTime());
    if (isHoliday) {
        return { success: false, error: 'As férias não podem se iniciar em feriados.' };
    }

    // 3. Prohibit starting 2 days before weekend or holiday (CLT Art. 134 § 3º)
    const nextDay = startOfDay(addDays(start, 1));
    const inTwoDays = startOfDay(addDays(start, 2));

    const forbiddenStarts = [nextDay, inTwoDays];
    for (const d of forbiddenStarts) {
        const dDay = getDay(d);
        const dIsHoliday = holidays.some((h: any) => d.getTime() === startOfDay(h.date).getTime());
        if (dDay === 0 || dDay === 6 || dIsHoliday) {
            return { success: false, error: 'O início das férias não pode preceder feriado ou dia de descanso em menos de dois dias.' };
        }
    }

    // 4. Check for Overlap with other Vacations
    const endDate = addDays(start, daysCount - 1);
    const overlappingVacation = await prisma.vacationRequest.findFirst({
        where: {
            employeeId,
            OR: [
                { startDate: { lte: endDate }, endDate: { gte: start } }
            ]
        }
    });

    if (overlappingVacation) {
        return { success: false, error: 'O colaborador já possui férias agendadas ou em gozo neste período.' };
    }

    // 5. Check for Overlap with Medical Leaves
    const overlappingMedical = await prisma.medicalLeave.findFirst({
        where: {
            employeeId,
            OR: [
                { startDate: { lte: endDate }, endDate: { gte: start } }
            ]
        }
    });

    if (overlappingMedical) {
        return { success: false, error: 'O colaborador possui um afastamento médico registrado que sobrepõe este período.' };
    }

    // 6. Partition Rule (CLT: one period must be >= 14 days)
    const totalUsedAfterThis = existingRequests.reduce((acc, r) => acc + r.daysCount + r.soldDays, 0) + daysCount + soldDays;

    // If the user is exhausting the balance (30 days), we MUST ensure at least one request is >= 14 days
    if (totalUsedAfterThis === 30) {
        const has14DayPeriod = [...existingRequests.map(r => r.daysCount), daysCount].some(d => d >= 14);
        if (!has14DayPeriod) {
            return { success: false, error: 'Pela regra da CLT, ao parcelar as férias, pelo menos um dos períodos deve ter no mínimo 14 dias corridos.' };
        }
    }

    return { success: true };
}
