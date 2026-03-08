import { getDashboardStats, getHiringStats } from '@/modules/core/actions/stats';

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
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-0.5 w-8 bg-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">Ambiente de Gestão</span>
                    </div>
                    <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase leading-none">
                        Performance <span className="text-brand-orange">Corporativa</span>
                    </h1>
                    <p className="text-text-muted font-bold tracking-tight text-sm mt-2 font-mono">
                        [ SYSTEM_VERSION: 1.2.0-PREMIUM ] — ANALYTICS & OPS
                    </p>
                </div>
                <div className="bg-surface-secondary p-2 rounded-2xl border border-border backdrop-blur-md">
                    <DashboardFilters companies={companies} stores={stores} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Attendance Widget - Takes 2 cols */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-[2.5rem] overflow-hidden shadow-2xl p-1">
                        <AttendanceWidget overview={dailyOverview} />
                    </div>
                </div>

                <div className="relative group lg:col-span-1">
                    <div className="absolute inset-0 bg-brand-orange/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative h-full bg-gradient-to-br from-brand-orange to-orange-600 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden flex flex-col justify-between border border-white/10">
                        {/* Abstract Shape */}
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150" />

                        <div>
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight">Painel de <br />Controle</h3>
                                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                    <span className="text-white text-xl font-black">!</span>
                                </div>
                            </div>

                            <p className="text-white/80 font-bold text-sm leading-relaxed mb-8">
                                Atualmente existem <span className="text-white underline decoration-white/30 underline-offset-4">{stats.probationAlerts?.length || 0}</span> contratos em período crítico de experiência. Recomenda-se revisão imediata.
                            </p>
                        </div>

                        <Link href="/dashboard/personnel" className="w-full">
                            <span className="flex items-center justify-center w-full py-5 bg-white text-brand-orange text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-950 hover:text-white transition-all duration-300 shadow-xl shadow-black/20 group/btn">
                                Gerenciar Capital Humano
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </span>
                        </Link>
                    </div>
                </div>
            </div>

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
                <div className="bg-surface border border-border rounded-[2rem] p-1 overflow-hidden shadow-xl">
                    <EventMural events={stats.eventMural || []} />
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
