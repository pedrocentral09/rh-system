'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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
                    select: { store: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return { success: true, data: employees };
    } catch (error) {
        return { success: false, error: 'Failed to fetch employees' };
    }
}

export async function getWeeklyScales(startDate: Date, endDate: Date) {
    try {
        const scales = await prisma.workScale.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: { shiftType: true }
        });
        return { success: true, data: scales };
    } catch (error) {
        return { success: false, error: 'Failed to fetch scales' };
    }
}

export async function saveWorkScale(employeeId: string, date: Date, shiftTypeId: string | null) {
    try {
        if (shiftTypeId === 'FOLGA' || shiftTypeId === null) {
            // Delete existing scale if setting to Folga (or keep record with null shift? prefer record with null logic or delete)
            // Let's decide: WorkScale record with null shiftTypeId = Folga explicitly or just absence of record?
            // The schema says shiftTypeId String? // If null = Day Off (Folga)
            // So we Create/Update with null
            const payloadValue = shiftTypeId === 'FOLGA' ? null : shiftTypeId;

            await prisma.workScale.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date
                    }
                },
                create: {
                    employeeId,
                    date,
                    shiftTypeId: payloadValue
                },
                update: {
                    shiftTypeId: payloadValue
                }
            });
        } else {
            await prisma.workScale.upsert({
                where: {
                    employeeId_date: {
                        employeeId,
                        date
                    }
                },
                create: {
                    employeeId,
                    date,
                    shiftTypeId
                },
                update: {
                    shiftTypeId
                }
            });
        }

        revalidatePath('/dashboard/scales');
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to save scale' };
    }
}

export async function cloneWeeklyScale(targetWeekStart: Date) {
    try {
        const sourceStart = new Date(targetWeekStart);
        sourceStart.setDate(sourceStart.getDate() - 7);
        // Ensure we are comparing dates correctly (start of day)
        sourceStart.setHours(0, 0, 0, 0);

        const sourceEnd = new Date(sourceStart);
        sourceEnd.setDate(sourceEnd.getDate() + 6);
        sourceEnd.setHours(23, 59, 59, 999);

        // 1. Fetch source week data
        const sourceScales = await prisma.workScale.findMany({
            where: {
                date: {
                    gte: sourceStart,
                    lte: sourceEnd
                }
            }
        });

        if (sourceScales.length === 0) {
            return { success: false, error: 'Semana anterior não possui escalas para clonar.' };
        }

        // 2. Prepare operations for transaction
        const operations = sourceScales.map(scale => {
            const newDate = new Date(scale.date);
            newDate.setDate(newDate.getDate() + 7); // Shift 7 days forward

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

export async function generateAutomaticScale(weekStart: Date) {
    try {
        const startDate = new Date(weekStart);
        startDate.setHours(0, 0, 0, 0);

        // Get standard shift (first one alphabetically for now, or TODO: get from settings)
        const standardShift = await prisma.shiftType.findFirst({
            orderBy: { name: 'asc' }
        });

        if (!standardShift) {
            return { success: false, error: 'Nenhum turno cadastrado para usar como padrão.' };
        }

        // Get all active employees
        const employees = await prisma.employee.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true }
        });

        const operations = [];

        // For each employee
        for (const emp of employees) {
            // For Monday (0) to Friday (4) - relative to weekStart (Mon)
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(currentDate.getDate() + i);

                // Logic: Mon(0)..Fri(4) = Work, Sat(5)/Sun(6) = Folga (null)
                // Note: weekStart is Monday.
                const isWeekend = i >= 5; // 5=Sat, 6=Sun
                const shiftValue = isWeekend ? null : standardShift.id;

                operations.push(
                    prisma.workScale.upsert({
                        where: {
                            employeeId_date: {
                                employeeId: emp.id,
                                date: currentDate
                            }
                        },
                        create: {
                            employeeId: emp.id,
                            date: currentDate,
                            shiftTypeId: shiftValue
                        },
                        update: {
                            // Only update if it doesn't exist? Or overwrite?
                            // "Automatic" usually implies overwriting / resetting.
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
