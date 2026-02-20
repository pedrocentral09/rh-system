'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

import { addDays } from 'date-fns';

export async function createShiftType(formData: FormData) {
    const name = formData.get('name') as string;
    const startTime = formData.get('startTime') as string;
    const endTime = formData.get('endTime') as string;
    const breakDuration = parseInt(formData.get('breakDuration') as string || '60');

    try {
        await prisma.shiftType.create({
            data: {
                name,
                startTime,
                endTime,
                breakDuration
            }
        });
        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        console.error('Error creating shift type:', error);
        return { success: false, error: 'Failed to create shift type' };
    }
}

export async function updateShiftType(id: string, data: { name?: string, startTime?: string, endTime?: string, breakDuration?: number }) {
    try {
        await prisma.shiftType.update({
            where: { id },
            data
        });
        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        console.error('Error updating shift type:', error);
        return { success: false, error: 'Failed to update shift type' };
    }
}

export async function getShiftTypes() {
    try {
        const shifts = await prisma.shiftType.findMany({
            orderBy: { name: 'asc' }
        });
        return { success: true, data: shifts };
    } catch (error) {
        return { success: false, error: 'Failed to fetch shifts' };
    }
}

export async function deleteShiftType(id: string) {
    try {
        await prisma.shiftType.delete({ where: { id } });
        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete shift' };
    }
}

// --- Scale Management Actions ---

export async function getEmployeesForScale() {
    try {
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: {
                id: true,
                name: true,
                jobTitle: true,
                department: true,
                contract: {
                    select: {
                        store: { select: { id: true, name: true } },
                        sectorDef: { select: { name: true } }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: employees };
    } catch (error) {
        console.error('Error fetching employees for scale:', error);
        return { success: false, error: 'Failed to fetch employees' };
    }
}

export async function getWeeklyScales(startDate: Date, endDate: Date) {
    try {
        // Force absolute UTC range
        const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
        const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate(), 23, 59, 59, 999));

        const scales = await prisma.workScale.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end
                }
            }
        });
        return { success: true, data: scales };
    } catch (error) {
        return { success: false, error: 'Failed to fetch scales' };
    }
}

export async function saveWorkScale(employeeId: string, date: Date, shiftTypeId: string | null) {
    try {
        // 1. Normalize Date (Start of day UTC ALWAYS)
        const normalizedDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));

        // 2. Handle empty or "FOLGA" as null
        const finalShiftId = (shiftTypeId === 'FOLGA' || shiftTypeId === '' || shiftTypeId === null)
            ? null
            : shiftTypeId;

        await prisma.workScale.upsert({
            where: {
                employeeId_date: {
                    employeeId,
                    date: normalizedDate
                }
            },
            create: {
                employeeId,
                date: normalizedDate,
                shiftTypeId: finalShiftId
            },
            update: {
                shiftTypeId: finalShiftId
            }
        });

        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        console.error('Error saving scale:', error);
        return { success: false, error: 'Falha ao salvar escala.' };
    }
}

export async function saveWorkScalesBatch(employeeId: string, changes: { date: Date, shiftTypeId: string | null }[]) {
    try {
        const operations = changes.map(change => {
            const normalizedDate = new Date(Date.UTC(change.date.getUTCFullYear(), change.date.getUTCMonth(), change.date.getUTCDate(), 0, 0, 0, 0));

            const finalShiftId = (change.shiftTypeId === 'FOLGA' || change.shiftTypeId === '' || change.shiftTypeId === null)
                ? null
                : change.shiftTypeId;

            return prisma.workScale.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date: normalizedDate
                    }
                },
                create: {
                    employeeId,
                    date: normalizedDate,
                    shiftTypeId: finalShiftId
                },
                update: {
                    shiftTypeId: finalShiftId
                }
            });
        });

        await prisma.$transaction(operations);
        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        console.error('Error saving scales batch:', error);
        return { success: false, error: 'Falha ao salvar lote de escalas.' };
    }
}

export async function cloneWeeklyScale(targetWeekStart: Date, employeeIds?: string[]) {
    try {
        const sourceStart = new Date(targetWeekStart);
        sourceStart.setUTCDate(sourceStart.getUTCDate() - 7);
        sourceStart.setUTCHours(0, 0, 0, 0);

        const sourceEnd = new Date(sourceStart);
        sourceEnd.setUTCDate(sourceEnd.getUTCDate() + 6);
        sourceEnd.setUTCHours(23, 59, 59, 999);

        // 1. Fetch source week data
        const sourceScales = await prisma.workScale.findMany({
            where: {
                date: {
                    gte: sourceStart,
                    lte: sourceEnd
                },
                ...(employeeIds && employeeIds.length > 0 ? { employeeId: { in: employeeIds } } : {})
            }
        });

        if (sourceScales.length === 0) {
            return { success: false, error: 'Semana anterior não possui escalas para clonar.' };
        }

        // 2. Prepare operations for transaction
        const operations = sourceScales.map(scale => {
            const d = new Date(scale.date);
            const newDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 7, 0, 0, 0, 0));

            const shiftVal = scale.shiftTypeId;

            return prisma.workScale.upsert({
                where: {
                    employeeId_date: {
                        employeeId: scale.employeeId,
                        date: newDate
                    }
                },
                create: {
                    employeeId: scale.employeeId,
                    date: newDate,
                    shiftTypeId: shiftVal
                },
                update: {
                    shiftTypeId: shiftVal
                }
            });
        });

        // 3. Execute Transaction
        await prisma.$transaction(operations);

        revalidatePath('/dashboard/scales');
        return { success: true, count: operations.length };
    } catch (error) {
        console.error('Error cloning scale:', error);
        return { success: false, error: 'Falha ao clonar escala da semana anterior.' };
    }
}

export async function generateAutomaticScale(weekStart: Date, employeeIds: string[], pattern: '5x2' | '6x1' = '5x2') {
    try {
        const startDate = new Date(Date.UTC(weekStart.getUTCFullYear(), weekStart.getUTCMonth(), weekStart.getUTCDate(), 0, 0, 0, 0));

        // Get standard shift
        const standardShift = await prisma.shiftType.findFirst({
            orderBy: { name: 'asc' }
        });

        if (!standardShift) {
            return { success: false, error: 'Nenhum turno cadastrado para usar como padrão.' };
        }

        const operations = [];

        // For each specific employee ID provided
        for (const empId of employeeIds) {
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate() + i, 0, 0, 0, 0));

                const dayOfWeek = currentDate.getUTCDay(); // 0 is Sunday, 1 is Monday...

                let isOffDay = false;

                if (pattern === '6x1') {
                    // 6x1: Off on Sunday (0)
                    isOffDay = (dayOfWeek === 0);
                } else {
                    // 5x2: Off on Saturday (6) and Sunday (0)
                    isOffDay = (dayOfWeek === 0 || dayOfWeek === 6);
                }

                const shiftValue = isOffDay ? null : standardShift.id;

                operations.push(
                    prisma.workScale.upsert({
                        where: {
                            employeeId_date: {
                                employeeId: empId,
                                date: currentDate
                            }
                        },
                        create: {
                            employeeId: empId,
                            date: currentDate,
                            shiftTypeId: shiftValue
                        },
                        update: {
                            shiftTypeId: shiftValue
                        }
                    })
                );
            }
        }

        await prisma.$transaction(operations);
        revalidatePath('/dashboard/scales');
        return { success: true, count: operations.length };

    } catch (error) {
        console.error('Error auto-generating scale:', error);
        return { success: false, error: 'Falha ao gerar escala automática.' };
    }
}
