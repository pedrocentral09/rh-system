import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import { unstable_cache } from 'next/cache';

export class StatsService extends BaseService {

    /**
     * Get dashboard stats with optional caching
     */
    static async getDashboardData(filters?: { companyId?: string, storeId?: string }): Promise<ServiceResult<any>> {
        try {
            // Define the fetcher function
            const fetcher = async () => {
                const baseContractFilter: any = {};
                if (filters?.companyId) baseContractFilter.companyId = filters.companyId;
                if (filters?.storeId) baseContractFilter.storeId = filters.storeId;

                const baseWhere: any = {};
                if (Object.keys(baseContractFilter).length > 0) {
                    baseWhere.contract = baseContractFilter;
                }

                // Date ranges for events
                const now = new Date();
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                const in30Days = new Date(today);
                in30Days.setDate(today.getDate() + 30);

                const [
                    totalEmployees,
                    activeEmployees,
                    terminatedEmployees,
                    stores,
                    allActiveEmployees,
                    allVacationRequests,
                    upcomingSuspensions,
                    allHealthData,
                    allMedicalLeaves
                ] = await Promise.all([
                    prisma.employee.count({ where: baseWhere }),
                    prisma.employee.count({ where: { ...baseWhere, status: 'ACTIVE' } }),
                    prisma.employee.count({ where: { ...baseWhere, status: 'TERMINATED' } }),
                    prisma.store.findMany({ select: { id: true, name: true } }),
                    prisma.employee.findMany({
                        where: { ...baseWhere, status: 'ACTIVE' },
                        select: {
                            id: true,
                            name: true,
                            dateOfBirth: true,
                            department: true,
                            photoUrl: true,
                            hireDate: true,
                            contract: {
                                select: {
                                    admissionDate: true,
                                    experienceDays: true,
                                    isExperienceExtended: true,
                                    experienceExtensionDays: true,
                                    sectorDef: {
                                        select: { name: true }
                                    }
                                }
                            }
                        }
                    }),
                    prisma.vacationRequest.findMany({
                        where: {
                            OR: [
                                { startDate: { gte: today, lte: in30Days } }, // Starting soon
                                { endDate: { gte: today, lte: in30Days } }    // Returning soon
                            ],
                            employee: {
                                ...baseWhere,
                                status: 'ACTIVE'
                            }
                        },
                        include: { employee: { select: { name: true, photoUrl: true, department: true } } },
                        orderBy: { startDate: 'asc' }
                    }),
                    prisma.disciplinaryRecord.findMany({
                        where: { type: 'SUSPENSION', returnDate: { gte: today } },
                        include: { employee: { select: { name: true, photoUrl: true, department: true } } },
                        orderBy: { returnDate: 'asc' }
                    }),
                    prisma.healthData.findMany({
                        include: { employee: { select: { id: true, name: true, photoUrl: true, department: true } } }
                    }),
                    prisma.medicalLeave.findMany({
                        where: { endDate: { gte: today, lte: in30Days }, status: 'APPROVED' },
                        include: { employee: { select: { name: true, photoUrl: true, department: true } } },
                        orderBy: { endDate: 'asc' }
                    })
                ]);

                // Holidays logic
                const { getUpcomingHolidays } = await import('@/lib/holidays');
                const upcomingHolidays = getUpcomingHolidays(30);

                // Process internal logic (Birthdays, Probation, etc.)
                const currentMonth = today.getMonth();

                const upcomingBirthdays = allActiveEmployees
                    .filter((e: any) => {
                        if (!e.dateOfBirth) return false;
                        const birth = new Date(e.dateOfBirth);
                        return birth.getUTCMonth() === currentMonth;
                    })
                    .map((e: any) => ({
                        id: e.id,
                        name: e.name,
                        photoUrl: e.photoUrl,
                        day: new Date(e.dateOfBirth).getUTCDate()
                    }))
                    .sort((a: any, b: any) => a.day - b.day);

                const sectorMap: Record<string, number> = {};
                allActiveEmployees.forEach((e: any) => {
                    const sectorName = e.contract?.sectorDef?.name || e.department || 'Outros';
                    sectorMap[sectorName] = (sectorMap[sectorName] || 0) + 1;
                });

                const probationAlerts = allActiveEmployees
                    .filter((e: any) => e.contract?.admissionDate)
                    .map((e: any) => {
                        const admission = new Date(e.contract!.admissionDate);
                        const daysInitial = e.contract!.experienceDays || 45;
                        const daysExtension = e.contract!.isExperienceExtended ? (e.contract!.experienceExtensionDays || 0) : 0;
                        const totalDays = daysInitial + daysExtension;

                        const expirationDate = new Date(admission);
                        expirationDate.setDate(admission.getDate() + totalDays);

                        const diffTime = expirationDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        if (diffDays >= -5 && diffDays <= 15) {
                            return {
                                id: e.id,
                                name: e.name,
                                photoUrl: e.photoUrl,
                                days: diffDays,
                                period: e.contract!.isExperienceExtended ? '2º Período (Final)' : `1º Período (${daysInitial}d)`,
                                expirationDate
                            };
                        }
                        return null;
                    })
                    .filter((e): e is any => e !== null)
                    .sort((a, b) => a.days - b.days);

                // Consolidated Event Mural
                const vacationStarts = (allVacationRequests || [])
                    .filter((v: any) => {
                        const start = new Date(v.startDate);
                        return start >= today && start <= in30Days;
                    })
                    .map((v: any) => ({
                        id: v.id,
                        type: 'vacation_start',
                        date: v.startDate,
                        title: `Início de Férias`,
                        employee: v.employee.name,
                        employeeId: v.employeeId,
                        photoUrl: v.employee.photoUrl,
                        color: 'orange'
                    }));

                const returnsFromVacation = (allVacationRequests || [])
                    .filter((v: any) => {
                        const end = new Date(v.endDate);
                        return end >= today && end <= in30Days;
                    })
                    .map((v: any) => ({
                        id: `${v.id}-return`,
                        type: 'vacation_end',
                        date: v.endDate,
                        title: `Retorno de Férias`,
                        employee: v.employee.name,
                        employeeId: v.employeeId,
                        photoUrl: v.employee.photoUrl,
                        color: 'sky'
                    }));

                const returnsFromSuspension = (upcomingSuspensions || [])
                    .filter((s: any) => s.returnDate && new Date(s.returnDate) >= today && new Date(s.returnDate) <= in30Days)
                    .map((s: any) => ({
                        id: s.id,
                        type: 'suspension_return',
                        date: s.returnDate,
                        title: `Retorno de Suspensão`,
                        employee: s.employee.name,
                        employeeId: s.employeeId,
                        photoUrl: s.employee.photoUrl,
                        color: 'pink'
                    }));

                const asoExpirations = (allHealthData || [])
                    .map((h: any) => {
                        const expirationDate = new Date(h.lastAsoDate);
                        expirationDate.setMonth(expirationDate.getMonth() + (h.periodicity || 12));
                        return { ...h, expirationDate };
                    })
                    .filter((h: any) => h.expirationDate >= today && h.expirationDate <= in30Days)
                    .map((h: any) => ({
                        id: h.id,
                        type: 'aso_expiration',
                        date: h.expirationDate,
                        title: `Vencimento de ASO`,
                        employee: h.employee.name,
                        employeeId: h.employee.id,
                        photoUrl: h.employee.photoUrl,
                        color: 'red'
                    }));

                const registrationUpdates = allActiveEmployees
                    .filter((e: any) => e.contract?.admissionDate)
                    .map((e: any) => {
                        const admission = new Date(e.contract!.admissionDate);
                        const nextUpdate = new Date(admission);

                        // Calculate next anniversary from now
                        nextUpdate.setFullYear(today.getFullYear());
                        if (nextUpdate < today) {
                            nextUpdate.setFullYear(today.getFullYear() + 1);
                        }

                        return {
                            id: `${e.id}-update`,
                            type: 'registration_update',
                            date: nextUpdate,
                            title: `Atualização Cadastral`,
                            employee: e.name,
                            employeeId: e.id,
                            photoUrl: e.photoUrl,
                            color: 'indigo'
                        };
                    })
                    .filter((e: any) => e.date <= in30Days);

                const medicalLeaveReturns = (allMedicalLeaves || [])
                    .map((m: any) => ({
                        id: m.id,
                        type: 'medical_return',
                        date: m.endDate,
                        title: `Retorno de Atestado`,
                        employee: m.employee.name,
                        employeeId: m.employeeId,
                        photoUrl: m.employee.photoUrl,
                        color: 'red'
                    }));

                // Combine everything
                const eventMural = [
                    ...upcomingHolidays.map(h => ({
                        id: `holiday-${h.date}`,
                        type: 'holiday',
                        date: h.date,
                        title: h.name,
                        color: 'emerald'
                    })),
                    ...vacationStarts,
                    ...returnsFromVacation,
                    ...returnsFromSuspension,
                    ...asoExpirations,
                    ...registrationUpdates,
                    ...medicalLeaveReturns
                ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

                return {
                    totalEmployees,
                    activeEmployees,
                    terminatedEmployees,
                    storeCount: stores.length,
                    sectorCount: Object.keys(sectorMap).length,
                    upcomingBirthdays: upcomingBirthdays.slice(0, 5),
                    probationAlerts: probationAlerts.slice(0, 6),
                    eventMural: eventMural.slice(0, 10),
                    sectorStats: Object.entries(sectorMap).map(([name, count]) => ({
                        name,
                        count,
                        percentage: Math.round((count / allActiveEmployees.length) * 100)
                    })).sort((a, b) => b.count - a.count)
                };
            };

            let data;
            try {
                // Use Next.js caching
                const getCachedData = unstable_cache(
                    fetcher,
                    [`dashboard-stats-${filters?.companyId || 'all'}-${filters?.storeId || 'all'}`],
                    { revalidate: 300, tags: ['stats'] } // Cache for 5 mins
                );
                data = await getCachedData();
            } catch (e) {
                // FALLBACK: If unstable_cache fails (e.g. running in a standalone script), call fetcher directly
                console.log('Skipping unstable_cache: No Next.js context. Falling back to direct fetch.');
                data = await fetcher();
            }

            const serialized = JSON.parse(JSON.stringify(data));
            return this.success(serialized);
        } catch (error) {
            return this.error(error, 'Erro ao calcular estatísticas do dashboard');
        }
    }
}
