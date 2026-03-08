'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getVacationData, checkVacationRights, createVacationRequest, deleteVacationRequest } from '../../vacations/actions';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Palmtree, Calendar, History, ShieldAlert, BadgeCheck, Clock, Info, Trash2, Loader2, ArrowRightCircle, Sun } from 'lucide-react';
import { formatSafeDate, parseSafeDate } from '@/shared/utils/date-utils';
import { Tabs } from '@/shared/components/ui/tabs';
import { MedicalLeaveTab } from './MedicalLeaveTab';

interface VacationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
    defaultTab?: string;
}

export function VacationModal({ isOpen, onClose, employeeId, employeeName, defaultTab = 'vacations' }: VacationModalProps) {
    const [periods, setPeriods] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

    // Form
    const [startDate, setStartDate] = useState('');
    const [daysCount, setDaysCount] = useState(30);
    const [soldDays, setSoldDays] = useState(0);

    useEffect(() => {
        if (isOpen && employeeId) {
            load();
        }
    }, [isOpen, employeeId]);

    async function load() {
        setLoading(true);
        await checkVacationRights(employeeId);
        const res = await getVacationData(employeeId);
        if (res.success) {
            setPeriods(res.data || []);
            // Auto-select the oldest open/expired period
            const actionable = res.data?.find((p: any) => p.status === 'EXPIRED' || p.status === 'OPEN');
            if (actionable) setSelectedPeriod(actionable.id);
        }
        setLoading(false);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedPeriod) return toast.error('Selecione um período aquisitivo.');

        const res = await createVacationRequest({
            employeeId,
            periodId: selectedPeriod,
            startDate: new Date(startDate),
            daysCount: Number(daysCount),
            soldDays: Number(soldDays)
        });

        if (res.success) {
            toast.success('Férias agendadas com sucesso!');
            load();
            setStartDate('');
        } else {
            toast.error(res.error);
        }
    }

    if (!isOpen) return null;

    const totalBalance = periods.reduce((acc, p) => {
        const used = p.requests.reduce((rAcc: number, r: any) => rAcc + r.daysCount + r.soldDays, 0);
        return acc + (p.status !== 'ACCRUING' ? (30 - used) : 0);
    }, 0);

    const vacationTabContent = (
        <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] border border-border overflow-hidden relative min-h-[600px] shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-blue/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="grid lg:grid-cols-12 gap-0 relative z-10">

                {/* Lateral Pane: Period Selection */}
                <div className="lg:col-span-5 border-r border-border p-10 space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-[1.25rem] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shadow-inner relative overflow-hidden group">
                                <div className="absolute inset-0 bg-brand-blue group-hover:bg-brand-blue/80 transition-colors" />
                                <Palmtree className="h-6 w-6 text-white relative z-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight leading-none">{employeeName}</h3>
                                <p className="text-[9px] font-black text-text-secondary uppercase tracking-widest mt-1.5 opacity-80">Gestão de Ciclos Aquisitivos</p>
                            </div>
                        </div>

                        <div className="bg-surface-secondary border border-border rounded-[2rem] p-8 relative overflow-hidden group shadow-inner">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                <Sun className="w-16 h-16 text-brand-blue" />
                            </div>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest block mb-1 opacity-80">Saldo Global Disponível</span>
                            <div className="flex items-baseline gap-3">
                                <span className="text-5xl font-black text-brand-blue tracking-tighter italic">{totalBalance}</span>
                                <span className="text-xs font-black text-text-secondary uppercase tracking-widest opacity-80">DIAS ÚTEIS</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">Histórico de Períodos</span>
                            <span className="text-[9px] font-bold text-text-secondary opacity-80 uppercase">Períodos Totais: {periods.length}</span>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {periods.map((period, i) => {
                                const totalUsed = period.requests.reduce((acc: number, r: any) => acc + r.daysCount + r.soldDays, 0);
                                const balance = 30 - totalUsed;
                                const isSelected = selectedPeriod === period.id;
                                const isFullyTaken = totalUsed >= 30;
                                const isAccruing = period.status === 'ACCRUING';

                                return (
                                    <motion.div
                                        key={period.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => !isFullyTaken && setSelectedPeriod(period.id)}
                                        className={`p-6 rounded-3xl border transition-all cursor-pointer relative group ${isSelected
                                            ? 'bg-surface border-brand-blue shadow-2xl shadow-brand-blue/10 scale-[1.02] z-10'
                                            : 'bg-surface-secondary/40 border-border hover:border-brand-blue/30'
                                            } ${isFullyTaken ? 'opacity-40 grayscale pointer-events-none' : ''}`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${period.status === 'EXPIRED' ? 'bg-red-500 animate-pulse' :
                                                    isAccruing ? 'bg-brand-orange' : 'bg-emerald-500'
                                                    }`} />
                                                <span className="text-[9px] font-black text-text-primary uppercase tracking-widest">
                                                    {period.status === 'EXPIRED' ? 'VENCIDO' : isAccruing ? 'EM AQUISIÇÃO' : 'LIBERADO'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-sm font-black ${isSelected ? 'text-brand-blue' : 'text-text-primary'}`}>{isAccruing ? '---' : `${balance}d`}</span>
                                                <p className="text-[8px] font-bold text-text-secondary uppercase tracking-tighter opacity-80">SALDO</p>
                                            </div>
                                        </div>

                                        <div className="text-[10px] font-black text-text-secondary uppercase tracking-tighter opacity-80">
                                            {formatSafeDate(period.startDate, 'dd.MM.yy')} — {formatSafeDate(period.endDate, 'dd.MM.yy')}
                                        </div>

                                        {period.requests.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                                                {period.requests.map((req: any) => (
                                                    <div key={req.id} className="flex justify-between items-center text-[9px] font-black uppercase text-text-secondary">
                                                        <span>{formatSafeDate(req.startDate, 'dd/MM')} - {formatSafeDate(req.endDate, 'dd/MM')}</span>
                                                        <span className="text-brand-blue font-black">{req.daysCount} DIAS</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Pane: Appointment Form */}
                <div className="lg:col-span-7 p-10 bg-white/[0.01]">
                    <AnimatePresence mode="wait">
                        {selectedPeriod ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Agendar Lançamento</h3>
                                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1">Configuração de Período de Gozo</p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4">Data Inicial (Efetivo)</label>
                                            <input
                                                type="date"
                                                required
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                                className="w-full h-16 bg-surface-secondary border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-sky-500/50 transition-all shadow-inner"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4">Total de Dias</label>
                                            <input
                                                type="number"
                                                min="5" max="30"
                                                required
                                                value={daysCount}
                                                onChange={e => setDaysCount(Number(e.target.value))}
                                                className="w-full h-16 bg-surface-secondary border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-sky-500/50 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4">Abono Pecuniário (Venda)</label>
                                        <select
                                            value={soldDays}
                                            onChange={e => setSoldDays(Number(e.target.value))}
                                            className="w-full h-16 bg-surface-secondary border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-sky-500/50 transition-all shadow-inner appearance-none cursor-pointer"
                                        >
                                            <option value="0" className="bg-surface">MANTER INTEGRALIDADE (GOZO TOTAL)</option>
                                            <option value="10" className="bg-surface">VENDER 10 DIAS (ABONO MÁXIMO)</option>
                                        </select>
                                    </div>

                                    <div className="p-8 bg-sky-500/5 border border-sky-500/10 rounded-3xl space-y-4">
                                        <div className="flex items-center gap-3">
                                            <Info className="w-4 h-4 text-sky-400" />
                                            <span className="text-[10px] font-black text-sky-400 uppercase tracking-[0.2em]">Resumo do Protocolo</span>
                                        </div>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div>
                                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Início do Afastamento</p>
                                                <p className="text-lg font-black text-text-primary uppercase tracking-tighter">
                                                    {startDate ? formatSafeDate(startDate, 'dd MMMM yyyy') : '---'}
                                                </p>
                                            </div>
                                            <div className="w-px h-10 bg-border hidden md:block" />
                                            <div>
                                                <p className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">Retorno Operacional</p>
                                                <p className="text-lg font-black text-text-primary uppercase tracking-tighter">
                                                    {startDate ? formatSafeDate(addDays(parseSafeDate(startDate)!, Number(daysCount)), 'dd MMMM yyyy') : '---'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-20 bg-brand-blue text-white rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-4 group border-b-4 border-black/20"
                                    >
                                        SALVAR AGENDA ESTRATÉGICA 🚀
                                        <ArrowRightCircle className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                                <div className="w-20 h-20 rounded-[2rem] bg-text-primary/2 border border-border flex items-center justify-center">
                                    <History className="w-10 h-10 text-text-muted opacity-20" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-text-secondary uppercase tracking-widest">Aguardando Seleção</h3>
                                    <p className="text-[10px] font-bold text-text-secondary opacity-80 uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
                                        Selecione um período aquisitivo no painel lateral para iniciar o agendamento de férias.
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );

    const medicalTabContent = (
        <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] border border-border p-10 relative overflow-hidden min-h-[600px] shadow-2xl">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="relative z-10">
                <div className="flex items-center gap-5 mb-12">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-inner relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500 group-hover:bg-red-400 transition-colors" />
                        <BadgeCheck className="h-8 w-8 text-white relative z-10" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic leading-none">{employeeName}</h3>
                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mt-2 opacity-80">Lançamento de Protocolos Médicos & Afastamentos</p>
                    </div>
                </div>
                <MedicalLeaveTab employeeId={employeeId} />
            </div>
        </div>
    );

    const tabs = [
        { id: 'vacations', label: '🌴 Férias e Descanso', content: vacationTabContent },
        { id: 'atestados', label: '🩺 Atestados Médicos', content: medicalTabContent }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gestão de Ausências e Afastamentos" width="5xl">
            <div className="p-2">
                <Tabs tabs={tabs} defaultValue={defaultTab} />
            </div>
        </Modal>
    );
}