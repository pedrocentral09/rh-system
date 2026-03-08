import { Decimal } from '@prisma/client/runtime/library';

/**
 * Recursively converts Prisma Decimal objects to numbers for Client Component compatibility.
 * Also handles Date objects if needed, though Next.js 15+ handles them better now.
 * We'll focus on Decimals as they are specifically mentioned in the error.
 */
export function serializePrisma<T>(data: T): T {
    if (data === null || data === undefined) return data;

    if (data instanceof Decimal) {
        return data.toNumber() as any;
    }

    if (Array.isArray(data)) {
        return data.map(item => serializePrisma(item)) as any;
    }

    if (typeof data === 'object') {
        const result: any = {};
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                result[key] = serializePrisma((data as any)[key]);
            }
        }
        return result as T;
    }

    return data;
}
