import { format, addDays, isWithinInterval } from 'date-fns';

export interface Holiday {
    date: string; // YYYY-MM-DD
    name: string;
}

export const NATIONAL_HOLIDAYS: Holiday[] = []; // Now moved to Database

export function getHolidays(year: number): { date: Date, name: string }[] {
    return NATIONAL_HOLIDAYS.map(h => ({
        date: new Date(h.date + 'T12:00:00'),
        name: h.name
    })).filter(h => h.date.getFullYear() === year);
}

export function getUpcomingHolidays(days = 30): Holiday[] {
    const today = new Date();
    const end = addDays(today, days);

    return NATIONAL_HOLIDAYS.filter(h => {
        const holidayDate = new Date(h.date + 'T12:00:00');
        return isWithinInterval(holidayDate, { start: today, end: end });
    });
}
