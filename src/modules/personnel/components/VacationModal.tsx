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

                {/* Periods List */}
                <div className="grid gap-4">
                    {periods.map(period => {
                        const totalUsed = period.requests.reduce((acc: number, r: any) => acc + r.daysCount + r.soldDays, 0);
                        const balance = 30 - totalUsed;
                        const isExpired = period.status === 'EXPIRED';
                        const isAccruing = period.status === 'ACCRUING';

                        return (
                            <Card key={period.id}
                                className={`border transition-colors cursor-pointer ${selectedPeriod === period.id ? 'border-sky-500 bg-sky-50' : 'border-slate-200 hover:border-sky-300'}`}
                                onClick={() => !isExpired && setSelectedPeriod(period.id)}
                            >
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            Período: {format(new Date(period.startDate), 'dd/MM/yyyy')} a {format(new Date(period.endDate), 'dd/MM/yyyy')}
                                        </div>
                                        <div className="text-sm text-slate-500">
                                            Limite para gozo: {format(new Date(period.limitDate), 'dd/MM/yyyy')}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium text-slate-600">Saldo Atual</div>
                                        <div className={`text-2xl font-bold ${balance > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                            {balance} dias
                                        </div>
                                        {isExpired && <span className="text-xs text-red-500 font-bold">VENCIDO</span>}
                                        {isAccruing && <span className="text-xs text-amber-500 font-bold">EM AQUISIÇÃO</span>}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Scheduling Form */}
                {selectedPeriod && (
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 animate-in fade-in slide-in-from-top-2">
                        <h4 className="font-semibold text-slate-800 mb-4">Agendar Férias para Período Selecionado</h4>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Início das Férias</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full border p-2 rounded text-sm"
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
                                    className="w-full border p-2 rounded text-sm"
                                    value={daysCount}
                                    onChange={e => setDaysCount(Number(e.target.value))}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Vender Dias (Abono)</label>
                                <select
                                    className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-2 rounded text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                                    value={soldDays}
                                    onChange={e => setSoldDays(Number(e.target.value))}
                                >
                                    <option value="0">Não vender</option>
                                    <option value="10">Vender 10 dias</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white">
                                    Confirmar Agendamento
                                </Button>
                            </div>

                            {startDate && daysCount > 0 && (
                                <div className="col-span-4 text-xs text-slate-500 mt-2 bg-white p-2 rounded border border-slate-100">
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
