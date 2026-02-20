'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getVacationData, checkVacationRights, createVacationRequest, deleteVacationRequest } from '../../vacations/actions';
import { format, addDays, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar, History, ShieldAlert, BadgeCheck, Clock, Info, Trash2, Loader2 } from 'lucide-react';
import { formatSafeDate, parseSafeDate } from '@/shared/utils/date-utils';

interface VacationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
}

export function VacationModal({ isOpen, onClose, employeeId, employeeName }: VacationModalProps) {
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Férias: ${employeeName}`} width="5xl">
            <div className="grid md:grid-cols-12 gap-6">

                {/* Lateral: Resumo e Seleção de Período */}
                <div className="md:col-span-12 lg:col-span-5 space-y-6">
                    <Card className="bg-[#001B3D] text-white border-none shadow-xl overflow-hidden">
                        <CardContent className="p-6 relative">
                            <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#FF7800] mb-1">Saldo Disponível</h4>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tracking-tighter">{totalBalance}</span>
                                <span className="text-sm font-bold opacity-60 uppercase">Dias</span>
                            </div>
                            <p className="text-[10px] mt-2 opacity-50 font-medium leading-relaxed">
                                * Soma de todos os períodos aquisitivos já completados e ainda não gozados totalmente.
                            </p>
                        </CardContent>
                    </Card>

                    <div className="space-y-3">
                        <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Períodos Aquisitivos</h5>
                        {(() => {
                            // Deduplicate periods by startDate to avoid redundant cards
                            const uniquePeriods = periods.reduce((acc: any[], current: any) => {
                                const exists = acc.find(p =>
                                    format(new Date(p.startDate), 'yyyy-MM-dd') === format(new Date(current.startDate), 'yyyy-MM-dd')
                                );
                                if (!exists) {
                                    acc.push(current);
                                } else {
                                    exists.requests = [...(exists.requests || []), ...(current.requests || [])];
                                    exists.requests = exists.requests.filter((v: any, i: number, a: any[]) => a.findIndex(t => t.id === v.id) === i);
                                }
                                return acc;
                            }, []);

                            if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-sky-500" /></div>;

                            return uniquePeriods.map(period => {
                                const totalUsed = period.requests.reduce((acc: number, r: any) => acc + r.daysCount + r.soldDays, 0);
                                const balance = 30 - totalUsed;
                                const isExpired = period.status === 'EXPIRED';
                                const isAccruing = period.status === 'ACCRUING';
                                const isSelected = selectedPeriod === period.id;
                                const hasRequests = period.requests.length > 0;
                                const isFullyTaken = totalUsed >= 30;

                                // Real-time Status Detection
                                const now = new Date();
                                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

                                const hasFutureRequests = period.requests.some((r: any) => new Date(r.startDate) > today);
                                const activeRequest = period.requests.find((r: any) => {
                                    const start = new Date(r.startDate);
                                    const end = new Date(r.endDate);
                                    return today >= start && today <= end;
                                });

                                // Proportional Days
                                let proportionalDays = 30;
                                let progressPercent = 100;
                                if (isAccruing) {
                                    const start = new Date(period.startDate);
                                    const diffDays = Math.max(0, differenceInDays(now, start));
                                    proportionalDays = Number(((diffDays / 365) * 30).toFixed(1));
                                    progressPercent = Math.min(100, Math.round((diffDays / 365) * 100));
                                }

                                let statusColor = 'text-sky-500 dark:text-sky-400';
                                let statusIcon = <BadgeCheck className="h-3 w-3" />;
                                let statusLabel = 'Disponível';

                                if (activeRequest) {
                                    statusColor = 'text-sky-500 dark:text-sky-400';
                                    statusLabel = 'Em Gozo';
                                    statusIcon = <Clock className="h-3 w-3" />;
                                } else if (hasFutureRequests) {
                                    statusColor = 'text-orange-500 dark:text-orange-400';
                                    statusLabel = 'Agendadas';
                                    statusIcon = <Calendar className="h-3 w-3" />;
                                } else if (isFullyTaken) {
                                    statusColor = 'text-emerald-500 dark:text-emerald-400';
                                    statusLabel = 'Tiradas';
                                    statusIcon = <BadgeCheck className="h-3 w-3" />;
                                } else if (isExpired) {
                                    statusColor = 'text-red-500 dark:text-red-400';
                                    statusLabel = 'Vencido';
                                    statusIcon = <ShieldAlert className="h-3 w-3" />;
                                } else if (isAccruing) {
                                    statusColor = 'text-amber-500 dark:text-amber-400';
                                    statusLabel = 'Em Aquisição';
                                    statusIcon = <Clock className="h-3 w-3" />;
                                }

                                return (
                                    <div
                                        key={period.id}
                                        onClick={() => !isFullyTaken && setSelectedPeriod(period.id)}
                                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden relative group ${isSelected
                                            ? 'bg-white dark:bg-slate-900 border-[#FF7800] shadow-lg shadow-orange-500/10'
                                            : `bg-slate-50 dark:bg-slate-950 border-transparent dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700`
                                            } ${isFullyTaken ? 'opacity-60 cursor-not-allowed grayscale-[0.5]' : ''}`}
                                    >
                                        {isAccruing && (
                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800">
                                                <div
                                                    className="h-full bg-amber-500 transition-all duration-1000"
                                                    style={{ width: `${progressPercent}%` }}
                                                ></div>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`${statusColor}`}>{statusIcon}</div>
                                                <span className={`text-[9px] font-black uppercase tracking-tighter ${statusColor}`}>
                                                    {statusLabel}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-xs font-black ${isSelected ? 'text-slate-800 dark:text-white' : 'text-slate-800 dark:text-zinc-300'}`}>
                                                    {isAccruing ? `${proportionalDays}d` : `${balance}d`}
                                                </div>
                                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                    {isFullyTaken ? 'Ciclo Completo' : 'Saldo'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-[8px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Período Aquisitivo</div>
                                            <div className={`text-xs font-bold ${isSelected ? 'text-[#001B3D] dark:text-orange-200' : 'text-[#001B3D] dark:text-zinc-400'}`}>
                                                {formatSafeDate(period.startDate, 'dd/MM/yy')} — {formatSafeDate(period.endDate, 'dd/MM/yy')}
                                            </div>
                                        </div>

                                        {hasRequests && (
                                            <div className="mt-3 space-y-1.5 border-t dark:border-slate-800 pt-3">
                                                {period.requests.map((req: any) => {
                                                    const rStart = new Date(req.startDate);
                                                    const rEnd = new Date(req.endDate);
                                                    const isCurrent = today >= rStart && today <= rEnd;
                                                    const isPast = today > rEnd;

                                                    return (
                                                        <div key={req.id} className="flex justify-between items-center text-[10px] group/item">
                                                            <div className="flex items-center gap-2">
                                                                <span className={`font-bold ${isCurrent ? 'text-sky-500 dark:text-sky-400' : isPast ? 'text-slate-400 dark:text-zinc-600' : 'text-orange-500 dark:text-orange-400'}`}>
                                                                    {formatSafeDate(req.startDate, 'dd/MM')} - {formatSafeDate(req.endDate, 'dd/MM')}
                                                                </span>
                                                                {isCurrent && <span className="bg-sky-500 h-1 w-1 rounded-full animate-pulse"></span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-black text-[#FF7800] dark:text-orange-400">
                                                                    {req.daysCount}d {req.soldDays > 0 ? `(+${req.soldDays}a)` : ''}
                                                                </span>
                                                                {!isPast && (
                                                                    <button
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            if (confirm('Deseja realmente cancelar este agendamento?')) {
                                                                                const res = await deleteVacationRequest(req.id);
                                                                                if (res.success) {
                                                                                    toast.success('Agendamento cancelado!');
                                                                                    load();
                                                                                } else {
                                                                                    toast.error(res.error);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                {/* Principal: Formulário e Histórico */}
                <div className="md:col-span-12 lg:col-span-7 space-y-6">
                    {selectedPeriod && (
                        <Card className="border-slate-100 dark:border-slate-800 shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-4">
                                <CardTitle className="text-sm font-black text-[#001B3D] dark:text-white uppercase tracking-tight flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[#FF7800]" />
                                    Agendar Férias
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Início</label>
                                            <input
                                                type="date"
                                                required
                                                className="w-full bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 p-2.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF7800]/20 transition-all outline-none"
                                                value={startDate}
                                                onChange={e => setStartDate(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Dias de Gozo</label>
                                            <input
                                                type="number"
                                                min="5" max="30"
                                                required
                                                className="w-full bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 p-2.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF7800]/20 transition-all outline-none"
                                                value={daysCount}
                                                onChange={e => setDaysCount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 dark:text-zinc-400 uppercase tracking-widest">Abono Pecuniário (Venda de Dias)</label>
                                        <select
                                            className="w-full bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 p-2.5 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-[#FF7800]/20 transition-all outline-none"
                                            value={soldDays}
                                            onChange={e => setSoldDays(Number(e.target.value))}
                                        >
                                            <option value="0">Não vender dias</option>
                                            <option value="10">Vender 10 dias (Máximo Legal)</option>
                                        </select>
                                    </div>

                                    <Button type="submit" className="w-full bg-[#FF7800] hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-black py-6 rounded-xl shadow-lg shadow-orange-900/10 transition-all">
                                        Salvar Lançamento
                                    </Button>

                                    {startDate && daysCount > 0 && selectedPeriod && (
                                        <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-xl border border-orange-100 dark:border-orange-900/50 space-y-2">
                                            <p className="text-[10px] text-orange-800 dark:text-orange-300 font-bold leading-relaxed">
                                                RESUMO: O colaborador sairá dia <strong>{formatSafeDate(startDate, 'dd/MM/yy')}</strong> e retornará dia <strong>{formatSafeDate(addDays(parseSafeDate(startDate)!, Number(daysCount)), 'dd/MM/yy')}</strong>.
                                            </p>
                                        </div>
                                    )}
                                </form>
                            </CardContent>
                        </Card>
                    )}

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                        <div className="bg-[#FF7800]/10 p-3 rounded-2xl">
                            <Info className="h-6 w-6 text-[#FF7800]" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-[#001B3D] dark:text-white uppercase tracking-tight">Regras de Férias</h4>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">
                                Selecione um período ao lado para agendar novas férias. O sistema respeita o limite de 30 dias por período aquisitivo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}