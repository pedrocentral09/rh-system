
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
import { motion, AnimatePresence } from 'framer-motion';

interface VacationDashboardClientProps {
    summary: any[];
    pendingRequests: any[];
    allVacations: any[]; 
}

export function VacationDashboardClient({ summary, pendingRequests, allVacations }: VacationDashboardClientProps) {
    const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string } | null>(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Stats
    const expiredCount = summary.filter(s => s.status === 'EXPIRED').length;
    const openCount = summary.filter(s => s.status === 'OPEN').length;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6 pb-12"
        >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Férias Vencidas', value: expiredCount, icon: ShieldAlert, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Saldos Abertos', value: openCount, icon: BadgeCheck, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Solicitações', value: pendingRequests.length, icon: Clock, color: 'text-brand-blue', bg: 'bg-brand-blue/10' },
                    { label: 'Programadas', value: allVacations.filter(v => new Date(v.startDate) > new Date()).length, icon: Calendar, color: 'text-text-muted', bg: 'bg-surface-secondary' }
                ].map((stat, i) => (
                    <motion.div key={i} variants={itemVariants}>
                        <Card className="bg-surface border-none shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">{stat.label}</p>
                                    <div className={`text-3xl font-black ${stat.color}`}>{stat.value}</div>
                                </div>
                                <div className={`${stat.bg} p-3 rounded-2xl group-hover:scale-110 transition-transform`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Tabs defaultValue="overview" className="space-y-6" onValueChange={setActiveTab}>
                <motion.div variants={itemVariants} className="flex justify-between items-center">
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
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <TabsContent value="overview" className="space-y-6 outline-none mt-0">
                            <div className="grid gap-6 lg:grid-cols-2">
                                <Card className="border-none shadow-sm bg-surface overflow-hidden lg:col-span-2">
                                    <CardHeader className="border-b border-border py-4 px-6">
                                        <CardTitle className="text-sm font-black text-text-primary uppercase tracking-tight">Colaboradores e Saldos</CardTitle>
                                        <CardDescription className="text-xs text-text-muted font-medium">Gerencie o descanso remunerado da sua equipe.</CardDescription>
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
                                                        <tr 
                                                            key={emp.id} 
                                                            className="hover:bg-surface-secondary transition-all cursor-pointer group" 
                                                            onClick={() => setSelectedEmployee({ id: emp.id, name: emp.name })}
                                                        >
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-10 rounded-2xl bg-brand-orange/5 flex items-center justify-center border border-brand-orange/10 group-hover:bg-brand-orange group-hover:text-white transition-all">
                                                                        <User className="h-5 w-5" />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-text-primary group-hover:text-brand-orange transition-colors">{emp.name}</div>
                                                                        <div className="text-[10px] text-text-muted font-black uppercase">{emp.registration}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-text-muted font-black uppercase text-[10px] tracking-widest">{emp.department}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xl font-black text-text-primary">{emp.totalBalance}</span>
                                                                    <span className="text-[10px] font-bold text-text-muted uppercase">Dias</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                                                                    emp.status === 'EXPIRED' ? 'bg-red-500/10 text-red-500 border border-red-500/10' :
                                                                    emp.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/10' : 
                                                                    'bg-surface-secondary text-text-muted border border-border'
                                                                }`}>
                                                                    {emp.status === 'EXPIRED' ? 'Vencido' : emp.status === 'OPEN' ? 'Disponível' : 'Em Dia'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-xl bg-text-primary/5 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-white transition-all">
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
                        </TabsContent>

                        <TabsContent value="requests" className="outline-none mt-0">
                            {/* Requests content remains but styled more consistently */}
                            <Card className="border-none shadow-sm bg-surface overflow-hidden">
                                <CardHeader className="bg-[#161B29] text-white p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-orange/20 flex items-center justify-center">
                                            <Clock className="h-6 w-6 text-brand-orange" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black uppercase tracking-tight">Portal de Solicitações</CardTitle>
                                            <CardDescription className="text-white/40 text-xs font-bold uppercase tracking-widest">Controle de pedidos pendentes</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-20 text-center space-y-6">
                                    <div className="bg-text-primary/5 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto border-2 border-dashed border-border group-hover:border-brand-orange transition-all duration-500">
                                        <Clock className="h-10 w-10 text-text-muted/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-text-primary italic uppercase">Nada por aqui ainda</h3>
                                        <p className="text-text-muted text-xs max-w-sm mx-auto leading-relaxed font-medium">
                                            Quando seus colaboradores realizarem solicitações pelo Portal da Família, elas aparecerão listadas aqui para sua aprovação.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="calendar" className="outline-none mt-0">
                            <VacationCalendar vacations={allVacations} />
                        </TabsContent>

                        <TabsContent value="medical" className="outline-none mt-0">
                            <MedicalDashboard />
                        </TabsContent>
                    </motion.div>
                </AnimatePresence>
            </Tabs>

            <AnimatePresence>
                {selectedEmployee && (
                    <VacationDetailModal
                        isOpen={!!selectedEmployee}
                        onClose={() => setSelectedEmployee(null)}
                        employeeId={selectedEmployee.id}
                        employeeName={selectedEmployee.name}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
}
