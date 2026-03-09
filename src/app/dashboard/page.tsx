import { getDashboardStats, getHiringStats } from '@/modules/core/actions/stats';
import { DashboardHeader } from './components/DashboardHeader';

export const dynamic = 'force-dynamic';
import { getDailyOverview } from '@/modules/time-tracking/actions/timesheet';
import { AttendanceWidget } from '@/modules/time-tracking/components/AttendanceWidget';
import { HiringEvolutionChart } from '@/modules/core/components/HiringEvolutionChart';
import { prisma } from '@/lib/prisma';
import { DashboardFilters } from '@/modules/core/components/DashboardFilters';
import { DashboardStatsGrid } from '@/modules/core/components/DashboardStatsGrid';
import { QuickAccessGrid } from '@/modules/core/components/QuickAccessGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';
import { EventMural } from '@/modules/core/components/EventMural';
import { SectorDistribution } from '@/modules/core/components/SectorDistribution';
import { BirthdayMural } from '@/modules/core/components/BirthdayMural';
import { getBIIntelAction } from '@/modules/bi/actions/stats';
import { BIRatiosGrid } from '@/modules/bi/components/BIRatiosGrid';
import { ProductivityHeatmap } from '@/modules/bi/components/ProductivityHeatmap';
import { PendingRequestsWidget } from '@/modules/core/components/PendingRequestsWidget';

export default async function DashboardPage({ searchParams }: { searchParams: { companyId?: string, storeId?: string } }) {
    const filters = await searchParams; // Next.js 15+ searchParams are async

    const { success: statsSuccess, data: statsData } = await getDashboardStats(filters);
    const hiringResult = await getHiringStats(filters);
    const hiringData = (hiringResult.success && hiringResult.data) ? hiringResult.data : [];

    const companies = await prisma.company.findMany({ select: { id: true, name: true } });
    const stores = await prisma.store.findMany({ select: { id: true, name: true } });

    // Fetch Daily Overview for today
    // Format YYYY-MM-DD for local time
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const dailyResult = await getDailyOverview(todayStr, filters);
    const dailyOverview = (dailyResult.success && dailyResult.data) ? dailyResult.data : [];

    // BI Intel
    const biResult = await getBIIntelAction(filters);
    const biData = biResult.success ? biResult.data : null;

    // Default values if fetch fails
    const stats = (statsSuccess && statsData) ? statsData : {
        totalEmployees: 0,
        activeEmployees: 0,
        terminatedEmployees: 0,
        storeCount: 0,
        sectorCount: 0,
        sectorStats: [],
        upcomingBirthdays: [],
        birthdaysCount: 0,
        probationAlerts: [],
        eventMural: []
    };

    return (
        <div className="space-y-10">
            <DashboardHeader
                companies={companies}
                stores={stores}
                filters={filters}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Attendance Widget - Takes 2 cols */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl p-1">
                        <AttendanceWidget overview={dailyOverview} />
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <PendingRequestsWidget
                        pendingVacations={stats.pendingVacations || 0}
                        pendingSignatures={stats.pendingSignatures || 0}
                    />
                </div>
            </div>

            {/* BI Strategic Intelligence Section */}
            {
                biData && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center gap-4">
                            <h2 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em] italic flex items-center gap-3">
                                <div className="h-0.5 w-10 bg-brand-orange" />
                                BI & Inteligência de Capital Humano
                            </h2>
                        </div>
                        <BIRatiosGrid data={biData} />
                    </div>
                )
            }

            {/* Stats Grid */}
            <DashboardStatsGrid stats={stats} />

            {/* Charts & Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Department Distribution */}
                <div className="bg-surface border border-border rounded-[2rem] p-8 relative overflow-hidden group shadow-xl">
                    <h4 className="text-[10px] font-black text-text-muted dark:text-text-secondary uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                        Distribuição por Setor
                    </h4>

                    <SectorDistribution stats={stats.sectorStats || []} />
                </div>

                {/* Probation Alerts */}
                <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        Alertas de Experiência
                    </h4>

                    {(stats.probationAlerts || []).length > 0 ? (
                        <div className="space-y-3">
                            {stats.probationAlerts.map((emp: any) => (
                                <Link key={emp.id} href={`/dashboard/personnel?id=${emp.id}&tab=contract&mode=edit`} className="block group">
                                    <div className="flex justify-between items-center bg-surface-secondary hover:bg-surface-hover p-3 rounded-2xl border border-border transition-all duration-300">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange font-black text-xs overflow-hidden">
                                                {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-text-primary uppercase tracking-tighter">{emp.name}</p>
                                                <p className="text-[9px] text-text-muted uppercase font-black tracking-widest">{emp.period}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-brand-orange bg-brand-orange/10 px-2 py-0.5 rounded uppercase">{emp.days}d</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-text-muted">
                            <span className="text-3xl mb-2">🛡️</span>
                            <p className="text-xs font-black uppercase tracking-widest">Tudo regularizado</p>
                        </div>
                    )}
                </div>

                {/* Event Mural */}
                <div className="bg-surface border border-border rounded-[2rem] p-1 overflow-hidden shadow-xl text-center">
                    <EventMural events={stats.eventMural || []} />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                <div className="bg-surface border border-border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] pointer-events-none" />
                    <ProductivityHeatmap storeId={filters?.storeId} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-[2rem] p-8 shadow-xl h-full">
                        <HiringEvolutionChart data={hiringData} />
                    </div>
                </div>

                <BirthdayMural birthdays={stats.upcomingBirthdays || []} />
            </div>

            <div className="pt-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="h-px flex-1 bg-border" />
                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em]">Atalhos Estratégicos</h2>
                    <div className="h-px flex-1 bg-border" />
                </div>
                <QuickAccessGrid />
            </div>
        </div>
    );
}
