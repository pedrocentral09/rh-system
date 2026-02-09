'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { DisciplinaryRecord } from '@prisma/client';

export async function createDisciplinaryRecord(data: {
    employeeId: string;
    type: string;
    severity: string;
    date: Date;
    reason: string;
    description: string;
    daysSuspended?: number;
    managerId?: string;
    documents?: string; // JSON String
}) {
    try {
        const record = await prisma.disciplinaryRecord.create({
            data: {
                ...data,
                payrollStatus: data.type === 'SUSPENSION' ? 'PENDING' : 'IGNORED'
            }
        });

        revalidatePath('/dashboard/disciplinary');
        return { success: true, data: record };
    } catch (error) {
        console.error("Create Disciplinary Error:", error);
        return { success: false, error: 'Failed to create record' };
    }
}

export async function getDisciplinaryRecords() {
    try {
        const records = await prisma.disciplinaryRecord.findMany({
            include: {
                employee: {
                    select: {
                        id: true,
                        name: true,
                        department: true,
                        jobTitle: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        return { success: true, data: records };
    } catch (error) {
        return { success: false, error: 'Failed to fetch records' };
    }
}

export async function deleteDisciplinaryRecord(id: string) {
    try {
        await prisma.disciplinaryRecord.delete({ where: { id } });
        revalidatePath('/dashboard/disciplinary');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete record' };
    }
}
