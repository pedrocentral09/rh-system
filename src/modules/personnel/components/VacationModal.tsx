'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { getVacationData, checkVacationRights, createVacationRequest } from '../../vacations/actions';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

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
        // 1. Ensure rights are calculated up to date
        await checkVacationRights(employeeId);
        // 2. Fetch
        const res = await getVacationData(employeeId);
        if (res.success) setPeriods(res.data || []);
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Férias: ${employeeName}`} width="3xl">
            <div className="space-y-6">

                {/* Rule Info Banner - Clarifies the 30-day rule requested by user */}
                <Card className="bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/50">
                    <CardContent className="p-4 flex gap-3">
                        <div className="bg-sky-500/10 p-2 rounded-full h-fit mt-1">
                            <span className="text-sky-600 dark:text-sky-400 font-bold">ℹ️</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-sky-900 dark:text-sky-300">Como as férias são calculadas?</h4>
                            <p className="text-xs text-sky-800/80 dark:text-sky-400/80 leading-relaxed">
                                A cada 12 meses trabalhados (**Período Aquisitivo**), o colaborador ganha o direito a **30 dias** de férias.
                                Após esse ano, a empresa tem mais 12 meses (**Período Concessivo**) para conceder as férias antes que elas vençam.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Periods List */}
                <div className="grid gap-4">
                    {periods.map(period => {
                        const totalUsed = period.requests.reduce((acc: number, r: any) => acc + r.daysCount + r.soldDays, 0);
                        const balance = 30 - totalUsed;
                        const isExpired = period.status === 'EXPIRED';
                        const isAccruing = period.status === 'ACCRUING';

                        // Proportional calculation for ACCRUING periods (Days "earned" so far)
                        let proportionalDays = 0;
                        let progressPercent = 0;
                        if (isAccruing) {
                            const start = new Date(period.startDate).getTime();
                            const end = new Date(period.endDate).getTime();
                            const now = new Date().getTime();
                            const elapsed = Math.min(now - start, end - start);
                            progressPercent = Math.max(0, Math.round((elapsed / (end - start)) * 100));
                            proportionalDays = Math.floor((progressPercent / 100) * 30);
                        }

                        return (
                            <Card key={period.id}
                                className={`border transition-all cursor-pointer overflow-hidden ${selectedPeriod === period.id ? 'ring-2 ring-sky-500 border-transparent bg-sky-50 dark:bg-sky-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-sky-300'}`}
                                onClick={() => !isExpired && setSelectedPeriod(period.id)}
                            >
                                <CardContent className="p-0">
                                    <div className="p-4 flex items-center justify-between relative z-10">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`w-2 h-2 rounded-full ${isExpired ? 'bg-red-500' : isAccruing ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                                                    {isExpired ? 'Vencido' : isAccruing ? 'Período em Aquisição' : 'Aberto para Gozo'}
                                                </span>
                                            </div>
                                            <div className="font-semibold text-slate-900 dark:text-white">
                                                {format(new Date(period.startDate), 'dd/MM/yyyy')} a {format(new Date(period.endDate), 'dd/MM/yyyy')}
                                            </div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {isAccruing
                                                    ? `Garantidos até agora: ${proportionalDays} dias`
                                                    : `Limite para tirar: ${format(new Date(period.limitDate), 'dd/MM/yyyy')}`
                                                }
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-semibold text-slate-500 uppercase">Saldo</div>
                                            <div className={`text-3xl font-black ${balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                {balance}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 -mt-1 uppercase">Dias</div>
                                        </div>
                                    </div>

                                    {isAccruing && (
                                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 group-hover:bg-sky-100 transition-colors">
                                            <div
                                                className="h-full bg-amber-400 transition-all duration-1000"
                                                style={{ width: `${progressPercent}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Scheduling Form */}
                {selectedPeriod && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Agendar Férias</h4>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Início das Férias</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border dark:border-slate-700 dark:bg-slate-800 p-2 rounded text-sm text-slate-900 dark:text-slate-100"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Dias de Gozo</label>
                                <input
                                    type="number"
                                    min="5" max="30"
                                    required
                                    className="w-full border dark:border-slate-700 dark:bg-slate-800 p-2 rounded text-sm text-slate-900 dark:text-slate-100"
                                    value={daysCount}
                                    onChange={e => setDaysCount(Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Vender Dias (Abono)</label>
                                <select
                                    className="w-full border dark:border-slate-700 border-slate-300 dark:bg-slate-800 bg-white text-slate-900 dark:text-slate-100 p-2 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    value={soldDays}
                                    onChange={e => setSoldDays(Number(e.target.value))}
                                >
                                    <option value="0">Não vender</option>
                                    <option value="10">Vender 10 dias</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold">
                                    Confirmar
                                </Button>
                            </div>

                            {startDate && daysCount > 0 && (
                                <div className="col-span-4 text-xs text-slate-500 dark:text-slate-400 mt-2 bg-white dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                                    Resumo: O colaborador sairá dia <strong>{format(new Date(startDate), 'dd/MM/yy')}</strong> e retornará dia <strong>{format(addDays(new Date(startDate), Number(daysCount)), 'dd/MM/yy')}</strong>.
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </Modal>
    );
}