import { getDashboardStats, getHiringStats } from '@/modules/core/actions/stats';
import { getDailyOverview } from '@/modules/time-tracking/actions/timesheet';
import { AttendanceWidget } from '@/modules/time-tracking/components/AttendanceWidget';
import { HiringEvolutionChart } from '@/modules/core/components/HiringEvolutionChart';
import { prisma } from '@/lib/prisma';
import { DashboardFilters } from '@/modules/core/components/DashboardFilters';
import { DashboardStatsGrid } from '@/modules/core/components/DashboardStatsGrid';
import { QuickAccessGrid } from '@/modules/core/components/QuickAccessGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';

export default async function DashboardPage({ searchParams }: { searchParams: { companyId?: string, storeId?: string, sigStatus?: string } }) {
    const filters = await searchParams; // Next.js 15+ searchParams are async

    const { success: statsSuccess, data: statsData } = await getDashboardStats(filters);
    const hiringResult = await getHiringStats(filters);
    const hiringData = (hiringResult.success && hiringResult.data) ? hiringResult.data : [];

    const companies = await prisma.company.findMany({ select: { id: true, name: true } });
    const stores = await prisma.store.findMany({ select: { id: true, name: true } });

    // Fetch Daily Overview for today
    // Format YYYY-MM-DD for local time
    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
    const dailyResult = await getDailyOverview(todayStr);
    const dailyOverview = (dailyResult.success && dailyResult.data) ? dailyResult.data : [];

    // Default values if fetch fails
    const stats = (statsSuccess && statsData) ? statsData : {
        totalEmployees: 0,
        activeEmployees: 0,
        terminatedEmployees: 0,
        storeCount: 0,
        departmentCount: 0,
        departmentStats: [],
        upcomingBirthdays: [],
        birthdaysCount: 0,
        probationAlerts: []
    };

    return (
        <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter uppercase">RH <span className="text-orange-500">EXCEPCIONAL</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Painel de Controle Executivo & Análise</p>
                </div>
                <DashboardFilters companies={companies} stores={stores} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Attendance Widget - Takes 2 cols */}
                <div className="lg:col-span-2">
                    <AttendanceWidget overview={dailyOverview} />
                </div>

                <Card className="bg-slate-950 border-none shadow-[8px_8px_0px_0px_rgba(249,115,22,1)] rounded-none hover:translate-x-1 hover:-translate-y-1 transition-transform duration-300">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl font-black text-white uppercase tracking-tighter">👋 Olá, Gestor!</CardTitle>
                            <div className="w-8 h-8 rounded-none bg-orange-500 flex items-center justify-center animate-pulse">
                                <span className="text-slate-950 text-xs font-black">!</span>
                            </div>
                        </div>
                        <CardDescription className="text-slate-400 font-medium">
                            Você tem <span className="text-orange-500 font-bold">{stats.probationAlerts?.length || 0}</span> contratos vencendo em breve e <span className="text-emerald-400 font-bold">{stats.activeEmployees}</span> colaboradores ativos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/personnel">
                            <span className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 text-slate-950 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-slate-950 transition-all cursor-pointer shadow-lg active:scale-95">
                                GERENCIAR EQUIPE →
                            </span>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Grid - Moved to Client Component to fix Framer Motion Error */}
            <DashboardStatsGrid stats={stats} />

            {/* Charts & Lists Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Department Distribution */}
                <Card className="border-slate-200">
                    <CardHeader>
                        <CardTitle>Departamentos</CardTitle>
                        <CardDescription>Distribuição da equipe.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(stats.departmentStats || []).slice(0, 5).map((dept: any) => (
                            <div key={dept.name} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700">{dept.name}</span>
                                    <span className="text-slate-500">{dept.percentage}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-none overflow-hidden">
                                    <div
                                        className="h-full bg-orange-500"
                                        style={{ width: `${dept.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Probation Alerts */}
                <Card className="border-amber-200 bg-amber-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-800">
                            <span>⚠️</span> Fim de Experiência
                        </CardTitle>
                        <CardDescription className="text-amber-600/80">Contratos vencendo em breve.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {(stats.probationAlerts || []).length > 0 ? (
                            <div className="space-y-3">
                                {stats.probationAlerts.map((emp: any) => (
                                    <div key={emp.id} className="flex justify-between items-center bg-white p-2 rounded border border-amber-100 shadow-sm">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xs overflow-hidden">
                                                {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{emp.name}</p>
                                                <p className="text-[10px] text-amber-600 uppercase font-semibold">{emp.period}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-bold text-amber-700">{emp.days} dias</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-400">
                                <p className="text-sm">Nenhum contrato em alerta.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Evolution Chart Placeholder */}
                <div className="lg:col-span-1" />
            </div>

            {/* New Section for Evolution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <HiringEvolutionChart data={hiringData} />
                </div>
                {/* Birthdays Widget */}
                <div className="lg:col-span-1">
                    <Card className="border-slate-200 bg-gradient-to-b from-white to-pink-50/30 dark:from-slate-800 dark:to-slate-800/50 dark:border-slate-700 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                                <span>🎂</span> Aniversariantes
                            </CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Celebrações deste mês.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {(stats.upcomingBirthdays || []).length > 0 ? (
                                <div className="space-y-4">
                                    {stats.upcomingBirthdays.map((emp: any) => (
                                        <div key={emp.id} className="flex items-center space-x-3 pb-3 border-b border-pink-100 dark:border-slate-700 last:border-0 last:pb-0">
                                            <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/20 border-2 border-white dark:border-slate-600 shadow-sm flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold overflow-hidden">
                                                {emp.photoUrl ? <img src={emp.photoUrl} alt={emp.name} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{emp.name}</p>
                                                <p className="text-xs text-pink-600 dark:text-pink-400 font-medium">Dia {emp.day}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-slate-500">
                                    <p>Nenhum aniversariante em breve.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mt-12 mb-4">Acesso Rápido</h2>
            {/* Quick Access Grid - Moved to Client Component to fix Framer Motion Error */}
            <QuickAccessGrid />
        </div>
    );
}
