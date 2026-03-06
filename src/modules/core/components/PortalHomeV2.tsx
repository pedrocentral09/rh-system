'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/shared/components/ui/card';
import Link from 'next/link';
import {
    Clock,
    Calendar,
    FileText,
    Award,
    ChevronRight,
    TrendingUp,
    BellRing,
    Star,
    Coins,
    Palmtree,
    Paperclip
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { ClimateSurveyWidget } from '@/modules/performance/components/ClimateSurveyWidget';

interface PortalHomeV2Props {
    employeeName: string;
    jobRole: string;
    storeName: string;
    coinBalance: number;
    hoursBalance: string;
    nextVacation: string;
    lastPayslipDate: string;
    hoursBalanceRaw: number;
}

export default function PortalHomeV2({
    employeeName,
    jobRole,
    storeName,
    coinBalance,
    hoursBalance,
    nextVacation,
    lastPayslipDate,
    hoursBalanceRaw
}: PortalHomeV2Props) {

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    const formatMinutes = (mins: number) => {
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-10 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-1000 relative">
            {/* 1. Ultra Premium Header */}
            <div className="flex justify-between items-center px-1">
                <div className="space-y-1">
                    <motion.p
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-brand-orange text-[10px] font-[1000] uppercase tracking-[0.4em]"
                    >
                        Painel do Colaborador
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-[1000] tracking-tighter text-white"
                    >
                        Olá, <span className="text-slate-300">{employeeName.split(' ')[0]}</span>
                    </motion.h2>
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center relative group backdrop-blur-3xl shadow-xl"
                >
                    <BellRing className="h-6 w-6 text-white group-hover:text-brand-orange transition-colors" />
                    <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-brand-orange shadow-[0_0_15px_rgba(249,115,22,1)] border-2 border-[#0A0F1C]" />
                </motion.div>
            </div>

            {/* 2. Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div whileHover={{ y: -5 }} className="group">
                    <Card className="bg-[#161B29]/95 border border-white/10 rounded-[40px] overflow-hidden relative backdrop-blur-3xl shadow-2xl h-full transition-all group-hover:border-blue-500/30">
                        <CardContent className="p-8 text-white relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 bg-blue-500/20 rounded-2xl backdrop-blur-md border border-blue-500/30">
                                    <Clock className="h-7 w-7 text-blue-400 font-bold" />
                                </div>
                                <div className="bg-blue-500/20 text-blue-300 border border-blue-500/30 font-[1000] text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Atualizado Agora</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Banco de Horas</p>
                                <div className="flex items-baseline gap-3">
                                    <h3 className={cn(
                                        "text-6xl font-[1000] tracking-tighter uppercase italic",
                                        hoursBalanceRaw >= 0 ? "text-white" : "text-rose-400"
                                    )}>
                                        {hoursBalance}
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">horas acumuladas</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-10" />
                    </Card>
                </motion.div>

                <motion.div whileHover={{ y: -5 }} className="group">
                    <Card className="bg-[#161B29]/95 border border-white/10 rounded-[40px] overflow-hidden relative backdrop-blur-3xl shadow-2xl h-full transition-all group-hover:border-brand-orange/30">
                        <CardContent className="p-8 text-white relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-10">
                                <div className="p-4 bg-brand-orange/20 rounded-2xl backdrop-blur-md border border-brand-orange/30">
                                    <Coins className="h-7 w-7 text-brand-orange font-bold" />
                                </div>
                                <div className="bg-brand-orange/20 text-brand-orange border border-brand-orange/30 font-[1000] text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Meta de Março</div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Família Coins</p>
                                <div className="flex items-baseline gap-3">
                                    <h3 className="text-6xl font-[1000] tracking-tighter text-white uppercase italic">
                                        {coinBalance}
                                    </h3>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest text-balance">pontos de fidelidade</span>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-orange rounded-full blur-[100px] opacity-10" />
                    </Card>
                </motion.div>
            </div>

            {/* 3. Priority Actions */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-[1000] text-slate-400 uppercase tracking-[0.4em]">Atalhos Prioritários</h3>
                    <div className="h-px bg-white/10 flex-1 mx-8" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Holerite', icon: FileText, href: '/portal/payslips', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                        { label: 'Férias', icon: Palmtree, href: '/portal/vacations', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        { label: 'Documentos', icon: Paperclip, href: '/portal/documents', color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
                        { label: 'Carreira', icon: TrendingUp, href: '/portal/career', color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    ].map((action, i) => (
                        <Link key={i} href={action.href}>
                            <motion.div
                                whileTap={{ scale: 0.96 }}
                                className="bg-[#1A2333]/90 border border-white/10 p-5 rounded-[32px] flex items-center gap-5 hover:bg-white/[0.08] transition-all group backdrop-blur-2xl shadow-lg h-full"
                            >
                                <div className={cn("p-3.5 rounded-2xl transition-all border border-white/5 shrink-0", action.bg, action.color)}>
                                    <action.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className="font-[1000] text-white text-[11px] uppercase tracking-widest truncate">{action.label}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight truncate">Acessar registros</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-white transition-colors shrink-0" />
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* 4. Gamified Progress */}
            <div className="bg-[#161B29]/95 border border-white/10 rounded-[48px] p-10 overflow-hidden relative backdrop-blur-3xl shadow-2xl group">
                <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                    <div className="shrink-0 relative">
                        <div className="h-32 w-32 rounded-full border-[10px] border-white/5 flex items-center justify-center relative overflow-hidden group-hover:border-brand-orange/20 transition-all duration-700 shadow-inner">
                            <div className="absolute inset-0 bg-brand-orange rotate-[120deg] origin-bottom opacity-10" />
                            <span className="text-4xl font-[1000] text-white italic">75%</span>
                        </div>
                        <div className="absolute -top-1 -right-1 h-9 w-9 bg-brand-orange rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/40 rotate-12">
                            <Star className="h-5 w-5 text-white fill-white" />
                        </div>
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div>
                            <h4 className="text-3xl font-[1000] text-white tracking-widest uppercase italic mb-1">Nível Experiente</h4>
                            <p className="text-[10px] font-[1000] text-blue-400 uppercase tracking-[0.3em]">Jornada de Reconhecimento</p>
                        </div>
                        <p className="text-slate-400 text-xs font-[1000] leading-relaxed uppercase tracking-tighter max-w-[480px]">
                            Seu desempenho impactou <span className="text-white">várias famílias</span> este mês. Continue evoluindo para desbloquear <span className="text-brand-orange">novos benefícios corporativos</span>.
                        </p>

                        <div className="space-y-2 mt-4 max-w-sm mx-auto md:mx-0">
                            <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden p-[2px] border border-white/10 shadow-inner">
                                <motion.div
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '75%' }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                    className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.5)]"
                                />
                            </div>
                            <div className="flex justify-between items-center text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <span>Iniciante</span>
                                <span className="text-white">Mestre do Cuidado</span>
                            </div>
                        </div>
                    </div>
                    <Button className="rounded-full px-10 py-8 bg-white text-slate-900 font-[1000] text-[11px] uppercase tracking-[0.25em] shadow-2xl hover:bg-slate-100 active:scale-95 transition-all">Ver Minha Trilha</Button>
                </div>
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
            </div>

            {/* 5. Climate Widget */}
            <div className="pt-6">
                <ClimateSurveyWidget />
            </div>

            {/* 6. Footer Branding */}
            <div className="text-center pt-12 pb-10 opacity-30">
                <div className="flex items-center justify-center gap-4">
                    <div className="h-px w-12 bg-white/10" />
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 whitespace-nowrap">Rede Família Digital • 2026</p>
                    <div className="h-px w-12 bg-white/10" />
                </div>
            </div>
        </div>
    );
}
