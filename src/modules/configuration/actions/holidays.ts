'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getHolidays() {
    try {
        const holidays = await prisma.holiday.findMany({
            orderBy: { date: 'asc' }
        });
        return { success: true, data: holidays };
    } catch (error) {
        console.error('Error fetching holidays:', error);
        return { success: false, error: 'Failed to fetch holidays' };
    }
}

export async function createHoliday(data: { date: string, name: string }) {
    try {
        const [y, m, d] = data.date.split('-').map(Number);
        const queryDate = new Date(Date.UTC(y, m - 1, d));

        const holiday = await prisma.holiday.create({
            data: {
                date: queryDate,
                name: data.name
            }
        });
        revalidatePath('/dashboard/configuration');
        return { success: true, data: holiday };
    } catch (error) {
        console.error('Error creating holiday:', error);
        return { success: false, error: 'Failed to create holiday' };
    }
}

export async function deleteHoliday(id: string) {
    try {
        await prisma.holiday.delete({
            where: { id }
        });
        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Error deleting holiday:', error);
        return { success: false, error: 'Failed to delete holiday' };
    }
}
