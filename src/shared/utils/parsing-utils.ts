
/**
 * Parse currency string (BRL) to number
 * @param value string like "R$ 1.234,56" or "1234,56" or "1234.56"
 */
export function parseCurrency(value: string | number | undefined | null): number | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;

    // Remove R$, spaces, and other non-numeric chars except dot and comma
    let clean = value.replace(/[R$\s]/g, '').trim();

    // Check if format is Brazilian (comma as decimal)
    if (clean.includes(',') && clean.includes('.')) {
        // e.g. 1.234,56 -> remove dot, replace comma with dot
        clean = clean.replace(/\./g, '').replace(',', '.');
    } else if (clean.includes(',')) {
        // e.g. 1234,56 -> replace comma with dot
        clean = clean.replace(',', '.');
    }
    // If only dot, assumed standard float 1234.56, keep as is

    const num = parseFloat(clean);
    return isNaN(num) ? undefined : num;
}

/**
 * Parse date string (DD/MM/YYYY or ISO) to Date object
 * @param value string like "15/12/2025" or "2025-12-15"
 */
export function parseDate(value: string | Date | undefined | null): Date | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value;

    // Check if DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
        const [day, month, year] = value.split('/').map(Number);
        return new Date(year, month - 1, day);
    }

    // Check if YYYY-MM-DD (ISO date part)
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
}
