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
        const result = await prisma.$transaction(async (tx) => {
            // 1. Validate employee existence
            const employee = await tx.employee.findUnique({
                where: { id: data.employeeId },
                select: { id: true, name: true }
            });

            if (!employee) {
                throw new Error('Colaborador não encontrado.');
            }

            // 2. Create the record
            const record = await tx.disciplinaryRecord.create({
                data: {
                    ...data,
                    payrollStatus: data.type === 'SUSPENSION' ? 'PENDING' : 'IGNORED'
                }
            });

            // 3. Register Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'CREATE',
                    module: 'personnel', // Corrigido de 'core' para 'personnel' conforme contexto do RH
                    resource: 'DisciplinaryRecord',
                    resourceId: record.id,
                    newData: JSON.stringify(record),
                }
            });

            return record;
        });

        revalidatePath('/dashboard/disciplinary');
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Create Disciplinary Error:", error);
        return { success: false, error: error.message || 'Failed to create record' };
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

export async function updateDisciplinaryRecord(id: string, data: {
    type?: string;
    severity?: string;
    date?: Date;
    reason?: string;
    description?: string;
    daysSuspended?: number;
    documents?: string;
}) {
    try {
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get old data for audit
            const oldRecord = await tx.disciplinaryRecord.findUnique({
                where: { id }
            });

            if (!oldRecord) {
                throw new Error('Registro não encontrado.');
            }

            // 2. Perform update
            const newRecord = await tx.disciplinaryRecord.update({
                where: { id },
                data: {
                    ...data,
                    payrollStatus: data.type === 'SUSPENSION' ? 'PENDING' : (data.type ? 'IGNORED' : undefined)
                }
            });

            // 3. Register Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'UPDATE',
                    module: 'personnel',
                    resource: 'DisciplinaryRecord',
                    resourceId: id,
                    oldData: JSON.stringify(oldRecord),
                    newData: JSON.stringify(newRecord),
                }
            });

            return newRecord;
        });

        revalidatePath('/dashboard/disciplinary');
        return { success: true, data: result };
    } catch (error: any) {
        console.error("Update Disciplinary Error:", error);
        return { success: false, error: error.message || 'Failed to update record' };
    }
}

export async function deleteDisciplinaryRecord(id: string) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Get data for audit before deletion
            const record = await tx.disciplinaryRecord.findUnique({
                where: { id }
            });

            if (!record) {
                throw new Error('Registro não encontrado.');
            }

            // 2. Delete the record
            await tx.disciplinaryRecord.delete({ where: { id } });

            // 3. Register Audit Log
            await tx.auditLog.create({
                data: {
                    action: 'DELETE',
                    module: 'personnel',
                    resource: 'DisciplinaryRecord',
                    resourceId: id,
                    oldData: JSON.stringify(record),
                }
            });
        });

        revalidatePath('/dashboard/disciplinary');
        return { success: true };
    } catch (error: any) {
        console.error("Delete Disciplinary Error:", error);
        return { success: false, error: error.message || 'Failed to delete record' };
    }
}
