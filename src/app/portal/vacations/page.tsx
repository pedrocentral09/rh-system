'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palmtree, Calendar, Clock, CheckCircle2, ChevronRight, AlertCircle, Loader2, Plane, Sun, Umbrella } from 'lucide-react';
import { getVacationData, createVacationRequest } from '@/modules/vacations/actions';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PortalVacationsPage() {
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [employeeId, setEmployeeId] = useState<string>('');
    const [isRequesting, setIsRequesting] = useState(false);

    // Form State
    const [selectedPeriod, setSelectedPeriod] = useState<any>(null);
    const [startDate, setStartDate] = useState('');
    const [daysCount, setDaysCount] = useState(15);
    const [soldDays, setSoldDays] = useState(0);

    const loadData = async () => {
        setLoading(true);
        const user = await getCurrentUser();
        if (user && (user as any).employee?.id) {
            const eId = (user as any).employee.id;
            setEmployeeId(eId);
            const res = await getVacationData(eId);
            if (res.success) setPeriods(res.data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRequest = async () => {
        if (!selectedPeriod || !startDate) {
            toast.error('Preencha todos os campos obrigatórios');
            return;
        }

        setIsRequesting(true);
        try {
            const res = await createVacationRequest({
                employeeId,
                periodId: selectedPeriod.id,
                startDate: new Date(startDate),
                daysCount,
                soldDays
            });

            if (res.success) {
                toast.success('Solicitação enviada com sucesso! Aguarde aprovação do gestor.');
                setSelectedPeriod(null);
                loadData();
            } else {
                toast.error(res.error || 'Falha ao solicitar férias');
            }
        } catch (error) {
            toast.error('Erro de conexão');
        } finally {
            setIsRequesting(false);
        }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
            <Umbrella className="h-14 w-14 animate-bounce text-blue-400" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Preparando seu Descanso...</p>
        </div>
    );

    const activePeriod = periods.find(p => p.status === 'OPEN');
    const accruingPeriod = periods.find(p => p.status === 'ACCRUING');

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-8 bg-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Qualidade de Vida</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Férias & <span className="text-slate-500">Licenças</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Gerencie seus períodos aquisitivos e planeje seu descanso.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stats & Current Balance */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden">
                        <Sun className="absolute -top-10 -right-10 h-40 w-40 opacity-10 rotate-12" />
                        <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Saldo Disponível</p>
                            <h3 className="text-6xl font-black italic tracking-tighter mb-2">30<span className="text-2xl not-italic ml-2 opacity-50">DIAS</span></h3>
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 leading-relaxed">Referente ao período <br /> {activePeriod ? format(new Date(activePeriod.startDate), 'yyyy') : '—'} / {activePeriod ? format(new Date(activePeriod.endDate), 'yyyy') : '—'}</p>
                        </div>
                    </div>

                    <div className="bg-[#111624] border border-white/5 rounded-[32px] p-8 space-y-6">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock className="h-3 w-3" /> Histórico de Períodos
                        </h4>
                        {periods.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between group">
                                <div>
                                    <p className="text-[11px] font-black text-white uppercase tracking-tight">{format(new Date(p.startDate), 'dd/MM/yy')} — {format(new Date(p.endDate), 'dd/MM/yy')}</p>
                                    <p className={cn(
                                        "text-[9px] font-bold uppercase tracking-widest mt-1",
                                        p.status === 'OPEN' ? "text-emerald-400" : "text-slate-500"
                                    )}>{p.status === 'OPEN' ? 'Vencido (Disponível)' : 'Em Aquisição'}</p>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Request Form */}
                <div className="lg:col-span-2">
                    <div className="bg-surface border border-border rounded-[48px] p-10 shadow-2xl relative overflow-hidden h-full">
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                    <Plane className="h-7 w-7 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nova Solicitação</h3>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Seu pedido será analisado pelo RH</p>
                                </div>
                            </div>

                            {!activePeriod ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                    <AlertCircle className="h-12 w-12 text-slate-700" />
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest max-w-xs leading-relaxed">
                                        Você ainda não possui períodos aquisitivos completos para solicitar férias.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data de Início</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full h-16 bg-[#111624] border border-white/10 rounded-2xl px-6 text-white font-black text-sm focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Duração (Dias)</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[10, 15, 20, 30].map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => setDaysCount(d)}
                                                        className={cn(
                                                            "h-12 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                                            daysCount === d ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                                                        )}
                                                    >
                                                        {d} Dias
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-8 bg-white/5 p-8 rounded-[32px] border border-white/5">
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest text-center">Resumo do Pedido</h4>
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
                                                <span>Retorno Previsto:</span>
                                                <span className="text-white">{startDate ? format(addDays(new Date(startDate), daysCount), 'dd/MM/yyyy') : '—'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase">
                                                <span>Abono Pecuniário:</span>
                                                <span className="text-white">Nenhum</span>
                                            </div>
                                            <div className="h-px bg-white/10" />
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-slate-500 uppercase">Status:</span>
                                                <span className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase">Pendente</span>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleRequest}
                                            disabled={isRequesting || !startDate}
                                            className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 mt-4"
                                        >
                                            {isRequesting ? 'Enviando...' : 'Solicitar Aprovação'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-0 right-0 -mr-20 -mb-20 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
