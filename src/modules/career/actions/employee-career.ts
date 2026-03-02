'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { differenceInMonths } from 'date-fns';

export async function getEmployeeCareerPath() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Não autenticado' };

        // Get Employee linked to this user
        const employee = await prisma.employee.findUnique({
            where: { userId: user.id },
            include: {
                contract: true,
                jobRole: true,
            },
        });

        if (!employee) {
            return { success: false, error: 'Perfil de colaborador não encontrado.' };
        }

        // Determine current Job Role
        const currentJobRoleId = employee.jobRoleId || employee.contract?.jobRoleId;
        if (!currentJobRoleId) {
            return {
                success: true,
                data: {
                    hasCareerPath: false,
                    employee: { name: employee.name, hireDate: employee.hireDate || employee.contract?.admissionDate },
                }
            };
        }

        // Find the Career Level for this Job Role
        const currentLevel = await prisma.careerLevel.findFirst({
            where: { jobRoleId: currentJobRoleId },
            include: {
                careerPath: {
                    include: {
                        levels: {
                            include: {
                                jobRole: true,
                                requirements: true,
                            },
                            orderBy: { order: 'asc' },
                        }
                    }
                }
            }
        });

        if (!currentLevel) {
            return {
                success: true,
                data: {
                    hasCareerPath: false,
                    employee: { name: employee.name, hireDate: employee.hireDate || employee.contract?.admissionDate },
                    currentRole: employee.jobRole?.name || 'Cargo Atual'
                }
            };
        }

        const path = currentLevel.careerPath;
        const levels = path.levels;

        // Find next level
        const currentOrder = currentLevel.order;
        const nextLevel = levels.find(l => l.order > currentOrder);

        // Calculate Time in Company (Tenure)
        let monthsInCompany = 0;
        const hireDate = employee.hireDate || employee.contract?.admissionDate;
        if (hireDate) {
            monthsInCompany = differenceInMonths(new Date(), new Date(hireDate));
        }

        return {
            success: true,
            data: {
                hasCareerPath: true,
                employee: { name: employee.name, hireDate, monthsInCompany },
                path: {
                    id: path.id,
                    name: path.name,
                    description: path.description,
                },
                levels: levels,
                currentLevelId: currentLevel.id,
                currentJobRole: employee.jobRole?.name,
                nextLevel: nextLevel || null,
            }
        };

    } catch (error: any) {
        console.error('Error fetching employee career path:', error);
        return { success: false, error: error.message };
    }
}
