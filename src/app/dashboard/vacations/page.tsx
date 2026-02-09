import { getAllVacations, getAllVacationPeriods } from '@/modules/vacations/actions';
import { VacationCalendar } from '@/modules/vacations/components/VacationCalendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/shared/components/ui/button';
import { Printer } from 'lucide-react';
import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default async function VacationsPage() {
    const { data: vacations } = await getAllVacations();
    const { data: periods } = await getAllVacationPeriods();

    // Calculate Stats from Periods
    const openPeriods = periods?.filter((p: any) => p.status === 'OPEN').length || 0;
    const expiredPeriods = periods?.filter((p: any) => p.status === 'EXPIRED').length || 0;
    const accumulatingPeriods = periods?.filter((p: any) => p.status === 'ACCRUING').length || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestão de Férias</h1>
                    <p className="text-slate-500 dark:text-slate-400">Visão geral de solicitações e períodos de férias.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hidden lg:block">
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                            <span className="text-slate-600 dark:text-slate-400">Aberto (Pronto)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                            <span className="text-slate-600 dark:text-slate-400">Aquisitivo (Trabalhando)</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <span className="text-slate-600 dark:text-slate-400">Vencido</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Períodos Vencidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {expiredPeriods}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Funcionários com férias vencidas</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Períodos Abertos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {openPeriods}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Prontos para gozo</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wide">Programadas (Próx. 30 dias)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800 dark:text-white">
                            {vacations?.filter((v: any) => new Date(v.startDate) > new Date() && new Date(v.startDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length || 0}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Saídas agendadas</p>
                    </CardContent>
                </Card>
            </div>

            <VacationCalendar vacations={vacations || []} />

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Histórico de Solicitações</CardTitle>
                    <CardDescription>Todas as férias registradas no sistema.</CardDescription>
                </CardHeader>
                <CardContent>
                    {vacations && vacations.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Colaborador</th>
                                        <th className="px-4 py-3">Período</th>
                                        <th className="px-4 py-3">Dias</th>
                                        <th className="px-4 py-3">Abono</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {vacations.map((v: any) => (
                                        <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                                {v.employee?.name}
                                                <div className="text-xs text-slate-500">{v.employee?.department}</div>
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                {format(new Date(v.startDate), 'dd/MM/yy', { locale: ptBR })} à {format(new Date(v.endDate), 'dd/MM/yy', { locale: ptBR })}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.daysCount} dias</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{v.soldDays > 0 ? `${v.soldDays} dias` : '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                                                        {v.status === 'APPROVED' ? 'Aprovado' : v.status}
                                                    </span>
                                                    <Link href={`/print/vacation/${v.id}`} target="_blank">
                                                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Imprimir Aviso">
                                                            <Printer className="h-4 w-4 text-slate-400 hover:text-slate-800" />
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">Nenhuma férias registrada ainda.</div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Direitos Aquisitivos (Saldos)</CardTitle>
                    <CardDescription>Visão geral dos períodos de férias de todos os colaboradores.</CardDescription>
                </CardHeader>
                <CardContent>
                    {periods && periods.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-4 py-3">Colaborador</th>
                                        <th className="px-4 py-3">Período Aquisitivo</th>
                                        <th className="px-4 py-3">Limite Concessivo</th>
                                        <th className="px-4 py-3">Saldo</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {periods.map((p: any) => {
                                        const used = p.requests.reduce((acc: number, r: any) => acc + r.daysCount + r.soldDays, 0);
                                        const balance = 30 - used;
                                        return (
                                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                                                    {p.employee?.name}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {format(new Date(p.startDate), 'dd/MM/yy', { locale: ptBR })} à {format(new Date(p.endDate), 'dd/MM/yy', { locale: ptBR })}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                    {format(new Date(p.limitDate), 'dd/MM/yy', { locale: ptBR })}
                                                </td>
                                                <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{balance} dias</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${p.status === 'EXPIRED' ? 'bg-red-100 text-red-700 border-red-200' :
                                                        p.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                            'bg-amber-100 text-amber-700 border-amber-200'
                                                        }`}>
                                                        {p.status === 'EXPIRED' ? 'Vencido' : p.status === 'OPEN' ? 'Aberto' : 'Em Aquisição'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-500">Nenhum período aquisitivo calculado. (Acesse o cadastro do funcionário para gerar).</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
