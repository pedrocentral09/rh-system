
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { VacationCalendar } from './VacationCalendar';
import { VacationDetailModal } from './VacationDetailModal';
import { MedicalDashboard } from '../../personnel/components/MedicalDashboard';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/shared/components/ui/button';
import { Printer, ShieldAlert, BadgeCheck, Clock, User, ArrowRight, Calendar, Stethoscope } from 'lucide-react';
import Link from 'next/link';

interface VacationDashboardClientProps {
    summary: any[];
    pendingRequests: any[];
    allVacations: any[]; // For the calendar and history
}

export function VacationDashboardClient({ summary, pendingRequests, allVacations }: VacationDashboardClientProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Stats
    const expiredCount = summary.filter(s => s.status === 'EXPIRED').length;
    const openCount = summary.filter(s => s.status === 'OPEN').length;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-surface border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Férias Vencidas</p>
                            <div className="text-3xl font-black text-red-600 dark:text-red-400">{expiredCount}</div>
                        </div>
                        <div className="bg-red-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                            <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Saldos Abertos</p>
                            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{openCount}</div>
                        </div>
                        <div className="bg-emerald-500/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                            <BadgeCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Solicitações</p>
                            <div className="text-3xl font-black text-brand-blue">{pendingRequests.length}</div>
                        </div>
                        <div className="bg-brand-blue/10 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                            <Clock className="h-6 w-6 text-brand-blue" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-surface border-none shadow-sm overflow-hidden group">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">Programadas</p>
                            <div className="text-3xl font-black text-text-primary">
                                {allVacations.filter(v => new Date(v.startDate) > new Date()).length}
                            </div>
                        </div>
                        <div className="bg-surface-secondary p-3 rounded-2xl group-hover:scale-110 transition-transform">
                            <Calendar className="h-6 w-6 text-text-muted" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center">
                    <TabsList className="bg-surface p-1 border border-border rounded-xl shadow-inner">
                        <TabsTrigger value="overview" className="rounded-lg font-black text-[10px] uppercase px-6 text-text-muted data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary">
                            Gestão de Férias
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="relative rounded-lg font-black text-[10px] uppercase px-6 text-text-muted data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary">
                            Solicitações
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="calendar" className="rounded-lg font-black text-[10px] uppercase px-6 text-text-muted data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary">
                            Calendário
                        </TabsTrigger>
                        <TabsTrigger value="medical" className="rounded-lg font-black text-[10px] uppercase px-6 text-text-muted data-[state=active]:bg-surface-secondary data-[state=active]:text-text-primary">
                            🩺 Depto Médico
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6 outline-none">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Vacation Summary Table */}
                        <Card className="border-none shadow-sm bg-surface overflow-hidden lg:col-span-2">
                            <CardHeader className="border-b border-border py-4 px-6">
                                <CardTitle className="text-sm font-black text-text-primary uppercase tracking-tight">Colaboradores e Saldos</CardTitle>
                                <CardDescription className="text-xs text-text-muted font-medium">Clique no colaborador para gerenciar agendamentos.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-text-primary/5 text-[10px] font-black uppercase text-text-muted border-b border-border">
                                            <tr>
                                                <th className="px-6 py-4">Colaborador</th>
                                                <th className="px-6 py-4">Departamento</th>
                                                <th className="px-6 py-4">Saldo Total</th>
                                                <th className="px-6 py-4">Status</th>
                                                <th className="px-6 py-4 text-right">Ação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {summary.map((emp) => (
                                                <tr key={emp.id} className="hover:bg-surface-secondary transition-all cursor-pointer group" onClick={() => setSelectedEmployee({ id: emp.id, name: emp.name })}>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-text-primary/5 flex items-center justify-center border border-border">
                                                                <User className="h-4 w-4 text-text-muted" />
                                                            </div>
                                                            <div className="font-bold text-text-primary">{emp.name}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-text-muted font-medium">{emp.department}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-lg font-black text-text-primary">{emp.totalBalance}</span>
                                                            <span className="text-[10px] font-bold text-text-muted uppercase">Dias</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${emp.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 dark:text-red-400' :
                                                            emp.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-surface-secondary text-text-muted'
                                                            }`}>
                                                            {emp.status === 'EXPIRED' ? 'Vencido' : emp.status === 'OPEN' ? 'Disponível' : 'Em Dia'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button variant="ghost" size="sm" className="bg-text-primary/5 hover:bg-brand-blue hover:text-white rounded-lg group-hover:translate-x-1 transition-all">
                                                            <ArrowRight className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border-none shadow-sm bg-surface overflow-hidden">
                        <CardHeader className="border-b border-border py-4 px-6">
                            <CardTitle className="text-sm font-black text-text-primary uppercase tracking-tight">Histórico Geral</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-text-primary/5 text-[10px] font-black uppercase text-text-muted border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4">Colaborador</th>
                                            <th className="px-6 py-4">Período</th>
                                            <th className="px-6 py-4">Dias</th>
                                            <th className="px-6 py-4">Abono</th>
                                            <th className="px-6 py-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {allVacations.slice(0, 10).map((v: any) => (
                                            <tr key={v.id} className="hover:bg-surface-secondary transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-text-primary">{v.employee?.name}</div>
                                                    <div className="text-[10px] text-text-muted font-medium">{v.employee?.department}</div>
                                                </td>
                                                <td className="px-6 py-4 text-text-secondary font-bold">
                                                    {format(new Date(v.startDate), 'dd/MM/yy', { locale: ptBR })} à {format(new Date(v.endDate), 'dd/MM/yy', { locale: ptBR })}
                                                </td>
                                                <td className="px-6 py-4 font-black text-text-primary">{v.daysCount} d</td>
                                                <td className="px-6 py-4 text-text-muted">{v.soldDays > 0 ? `${v.soldDays}d` : '-'}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-emerald-500/10 text-emerald-500 dark:text-emerald-300 uppercase border border-emerald-500/20">
                                                        Aprovado
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="requests" className="outline-none">
                    <Card className="border-none shadow-sm bg-surface overflow-hidden">
                        <CardHeader className="bg-brand-blue dark:bg-surface-secondary text-white dark:text-text-primary p-6">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Clock className="h-4 w-4 text-brand-orange" />
                                Portal de Solicitações
                            </CardTitle>
                            <CardDescription className="text-white/60 dark:text-text-muted text-xs font-medium">Aguardando implementação do Portal do Colaborador.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 text-center space-y-4">
                            <div className="bg-surface-secondary w-20 h-20 rounded-3xl flex items-center justify-center mx-auto border-2 border-dashed border-border">
                                <Clock className="h-8 w-8 text-text-muted/40" />
                            </div>
                            <div>
                                <h3 className="text-text-primary font-black uppercase tracking-tight">Nenhuma solicitação pendente</h3>
                                <p className="text-text-muted text-xs max-w-xs mx-auto mt-2 leading-relaxed font-medium">
                                    Pedidos realizados por colaboradores através do portal aparecerão aqui para aprovação do RH.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="calendar" className="outline-none">
                    <VacationCalendar vacations={allVacations} />
                </TabsContent>

                <TabsContent value="medical" className="outline-none">
                    <MedicalDashboard />
                </TabsContent>
            </Tabs>

            {selectedEmployee && (
                <VacationDetailModal
                    isOpen={!!selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                    employeeId={selectedEmployee.id}
                    employeeName={selectedEmployee.name}
                />
            )}
        </div>
    );
}
