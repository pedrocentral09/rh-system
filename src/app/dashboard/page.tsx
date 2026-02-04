import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { getDashboardStats, getHiringStats } from '@/modules/core/actions/stats';
import { getDailyOverview } from '@/modules/time-tracking/actions/timesheet';
import { AttendanceWidget } from '@/modules/time-tracking/components/AttendanceWidget';
import { HiringEvolutionChart } from '@/modules/core/components/HiringEvolutionChart';

export default async function DashboardPage() {
    const { success: statsSuccess, data: statsData } = await getDashboardStats();
    const hiringResult = await getHiringStats();
    const hiringData = (hiringResult.success && hiringResult.data) ? hiringResult.data : [];

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
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-950 dark:text-white">Dashboard</h1>
                <p className="text-slate-600 dark:text-slate-400">Visão geral do HR System</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Attendance Widget - Takes 2 cols */}
                <div className="lg:col-span-2">
                    <AttendanceWidget overview={dailyOverview} />
                </div>

                {/* Quick Actions / Highlights Placeholder or maybe move one of the small cards here? 
                    For now let's just leave it empty or put a welcome message? 
                    Actually, let's just make the Attendance Widget full width or share with something else?
                    The user wanted "High Impact". 
                    Let's make the Attendance Widget BIG (2 cols) and maybe an "Alerts" card next to it?
                    Or just put it above the number cards.
                */}
                <Card className="bg-white dark:bg-slate-800 border-l-4 border-indigo-600 dark:border-indigo-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">👋 Olá, Gestor!</CardTitle>
                        <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
                            Você tem {stats.probationAlerts?.length || 0} contratos vencendo em breve e {stats.activeEmployees} colaboradores ativos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard/personnel">
                            <span className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm">
                                Gerenciar Equipe →
                            </span>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-indigo-500 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-indigo-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Total Colaboradores</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalEmployees}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Cadastrados no sistema</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-emerald-500 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-emerald-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Ativos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.activeEmployees}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Atualmente trabalhando</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-blue-500 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-blue-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Lojas / Unidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.storeCount}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Lojas ativas com equipe</p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-amber-500 hover:shadow-md transition-shadow dark:bg-slate-800 dark:border-amber-400">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase">Departamentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.departmentCount}</div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Setores opercionais</p>
                    </CardContent>
                </Card>
            </div>

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
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full"
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
                                                {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
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

                {/* Hiring Evolution Chart NEW */}
                <div className="lg:col-span-3">
                    {/* 
                        Note: The layout is 3 columns. 
                        The chart is best viewed wider or in a separate row.
                        Let's put it in a new full-width row BELOW the 3-col grid, or 
                        integrate it. But the user asked to render it.
                        Let's check where we are inserting.
                        We are inside the lg:grid-cols-3 div.
                     */}
                </div>
            </div>

            {/* New Section for Evolution Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <HiringEvolutionChart data={hiringData} />
                </div>
                {/* Birthdays Widget moved here to balance layout if needed, or keep it above */}
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
                                                {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" /> : emp.name.charAt(0)}
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

            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2 mb-4">Acesso Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/personnel" className="block group">
                    <Card className="h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-indigo-300 dark:group-hover:border-indigo-500 group-hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-2 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors">
                                <span className="text-2xl">👥</span>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-indigo-800 dark:group-hover:text-indigo-400 transition-colors dark:text-slate-100">Gestão de Pessoal</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Gerenciar funcionários, admissões e documentos.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/scales" className="block group">
                    <Card className="h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-emerald-300 dark:group-hover:border-emerald-500 group-hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-2 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
                                <span className="text-2xl">📅</span>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-emerald-800 dark:group-hover:text-emerald-400 transition-colors dark:text-slate-100">Escalas de Trabalho</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Organizar turnos, folgas e escalas semanais.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/time-tracking" className="block group">
                    <Card className="h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-amber-300 dark:group-hover:border-amber-500 group-hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-2 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 transition-colors">
                                <span className="text-2xl">⏰</span>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-amber-800 dark:group-hover:text-amber-400 transition-colors dark:text-slate-100">Controle de Ponto</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Importar AFDs e gerenciar batidas.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>

                <Link href="/dashboard/configuration" className="block group">
                    <Card className="h-full border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group-hover:border-slate-400 dark:group-hover:border-slate-500 group-hover:shadow-md transition-all">
                        <CardHeader>
                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-lg flex items-center justify-center mb-2 group-hover:bg-slate-100 dark:group-hover:bg-slate-600 transition-colors">
                                <span className="text-2xl">⚙️</span>
                            </div>
                            <CardTitle className="text-lg font-bold group-hover:text-slate-900 dark:group-hover:text-white transition-colors dark:text-slate-100">Configurações</CardTitle>
                            <CardDescription className="text-slate-600 dark:text-slate-400">Dados da empresa, usuários e preferências.</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
