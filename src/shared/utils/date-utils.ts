import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Safely parses a date string from the API or an input (YYYY-MM-DD)
 * and returns a Date object at midnight local time.
 */
export function parseSafeDate(dateStr: string | Date | null | undefined): Date | null {
    if (!dateStr) return null;
    if (dateStr instanceof Date) return dateStr;

    // If it's a full ISO string (from API), it might have T00:00:00.000Z
    // We want the YYYY, MM, DD parts directly to avoid UTC shift
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length !== 3) return new Date(dateStr); // Fallback

    const [year, month, day] = parts.map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Safely formats a date for display, avoiding timezone shifts.
 */
export function formatSafeDate(date: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
    const d = parseSafeDate(date);
    if (!d) return '-';
    return format(d, formatStr, { locale: ptBR });
}
