'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import {
    Calendar,
    Palmtree,
    Clock,
    AlertCircle,
    ChevronRight,
    Plane,
    History
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface VacationPortalProps {
    periods: any[];
}

export function EmployeeVacationPortal({ periods }: VacationPortalProps) {
    const activePeriod = periods.find(p => p.status === 'OPEN' || p.status === 'EXPIRED') || periods[periods.length - 1];

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('pt-BR');
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ACCRUING': return { label: 'Em Aquisição', color: 'bg-blue-100 text-blue-700 border-blue-200' };
            case 'OPEN': return { label: 'Disponível', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
            case 'EXPIRED': return { label: 'Vencida', color: 'bg-red-100 text-red-700 border-red-200' };
            default: return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-200' };
        }
    };

    return (
        <div className="space-y-10 pb-12">
            {/* Vacation Status & Actions */}
            <div className="flex flex-col gap-6">
                <Card className="bg-white/[0.05] border border-white/10 rounded-[40px] overflow-hidden relative backdrop-blur-3xl shadow-2xl">
                    <CardContent className="p-8 text-white relative z-10">
                        <div className="flex justify-between items-start mb-10">
                            <div className="p-4 bg-brand-orange/20 rounded-2xl backdrop-blur-md border border-brand-orange/30">
                                <Palmtree className="h-7 w-7 text-brand-orange" />
                            </div>
                            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-[1000] text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full">Gozo Permitido</Badge>
                        </div>

                        <div className="space-y-1">
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3 text-balance">Meu Status de Férias</p>
                            <h3 className="text-4xl font-[1000] tracking-tighter leading-none mb-6 max-w-[300px] text-white">
                                {activePeriod?.status === 'OPEN' ? 'Pode Curtir!' : (activePeriod?.status === 'EXPIRED' ? 'Favor Agendar!' : 'Em Aquisição')}
                            </h3>
                            <div className="flex items-center gap-2.5 text-blue-400 text-[11px] font-black uppercase tracking-[0.1em] py-3 px-1 border-t border-white/5">
                                <Calendar className="h-4 w-4" /> Limite: <span className="text-white">{activePeriod?.limitDate ? formatDate(activePeriod.limitDate) : '--/--/----'}</span>
                            </div>
                        </div>
                    </CardContent>
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-blue rounded-full blur-[120px] opacity-10" />
                </Card>

                <div className="grid grid-cols-2 gap-4">
                    <button className="h-20 bg-white/[0.03] border border-white/10 rounded-[28px] flex items-center justify-center gap-4 hover:bg-white/[0.06] transition-all active:scale-95 group backdrop-blur-2xl">
                        <div className="p-3 bg-brand-orange/10 rounded-2xl group-hover:scale-110 transition-all border border-brand-orange/20">
                            <Plane className="h-5 w-5 text-brand-orange" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Solicitar</span>
                    </button>
                    <button className="h-20 bg-white/[0.03] border border-white/10 rounded-[28px] flex items-center justify-center gap-4 hover:bg-white/[0.06] transition-all active:scale-95 group backdrop-blur-2xl">
                        <div className="p-3 bg-white/5 rounded-2xl group-hover:scale-110 transition-all border border-white/10">
                            <History className="h-5 w-5 text-slate-400 group-hover:text-blue-400" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Histórico</span>
                    </button>
                </div>
            </div>

            {/* List of Periods */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Ciclos Aquisitivos</h3>
                    <div className="h-px bg-white/5 flex-1 mx-6" />
                </div>

                <div className="space-y-4">
                    {periods.slice().reverse().map((period) => {
                        const status = getStatusInfo(period.status);
                        const requests = period.requests || [];
                        const usedDays = requests.reduce((acc: number, r: any) => acc + r.daysCount, 0);

                        return (
                            <div key={period.id} className="bg-white/[0.03] border border-white/5 rounded-[36px] overflow-hidden backdrop-blur-2xl hover:bg-white/[0.05] transition-all group">
                                <div className="p-7 flex flex-col gap-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "h-14 w-14 rounded-[22px] flex items-center justify-center border transition-all",
                                                period.status === 'EXPIRED'
                                                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                                    : 'bg-white/5 text-slate-400 border-white/10 group-hover:text-blue-400'
                                            )}>
                                                <Calendar className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <h4 className="font-[1000] text-white text-base leading-none mb-2 tracking-tight">
                                                    {new Date(period.startDate).getFullYear()} <span className="text-slate-500 mx-1">/</span> {new Date(period.endDate).getFullYear()}
                                                </h4>
                                                <div className="flex items-center gap-3">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border",
                                                        period.status === 'OPEN' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                                                            period.status === 'ACCRUING' ? 'text-blue-400 bg-blue-400/10 border-blue-400/20' :
                                                                'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                                    )}>
                                                        {status.label}
                                                    </span>
                                                    <div className="h-1 w-1 rounded-full bg-white/10" />
                                                    <span className="text-[10px] text-slate-400 font-bold tracking-tight lowercase">
                                                        {formatDate(period.startDate)} — {formatDate(period.endDate)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 flex items-center justify-center text-slate-700 group-hover:text-white transition-colors">
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="flex-1 bg-white/[0.02] p-4 rounded-3xl border border-white/5 text-center sm:text-left">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Fruídos</p>
                                            <p className="text-2xl font-[1000] text-emerald-400 leading-none">{usedDays} <span className="text-[10px] text-slate-500 uppercase ml-1">dias</span></p>
                                        </div>
                                        <div className="flex-1 bg-white/[0.02] p-4 rounded-3xl border border-white/5 text-center sm:text-left">
                                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 opacity-80">Saldo</p>
                                            <p className={cn(
                                                "text-2xl font-[1000] leading-none",
                                                30 - usedDays > 0 ? 'text-blue-400' : 'text-slate-500'
                                            )}>
                                                {30 - usedDays} <span className="text-[10px] text-slate-500 uppercase ml-1">dias</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Detailed requests */}
                                    {requests.length > 0 && (
                                        <div className="space-y-2 mt-2 pt-4 border-t border-white/5">
                                            {requests.map((req: any) => (
                                                <div key={req.id} className="flex items-center justify-between bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                        <span className="text-[11px] font-black text-slate-200 uppercase tracking-tight">{req.daysCount} dias de férias gozadas</span>
                                                    </div>
                                                    <span className="text-[11px] font-[1000] text-slate-400 tracking-widest italic">{formatDate(req.startDate)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[36px] p-8 backdrop-blur-2xl shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-brand-blue/10 rounded-2xl text-blue-400 border border-blue-400/20">
                        <AlertCircle className="h-5 w-5" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-[0.2em] text-white">Direitos e Prazos Digitais</h4>
                </div>
                <p className="text-slate-400 text-xs font-semibold leading-relaxed tracking-tight">
                    As férias devem ser gozadas prioritariamente dentro do período concessivo. Férias vencidas devem ser tratadas com <span className="text-brand-orange">prioridade absoluta</span> junto ao seu gestor ou RH.
                </p>
            </div>
        </div>
    );
}
