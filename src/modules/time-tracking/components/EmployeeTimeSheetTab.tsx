import { useState, useEffect } from 'react';
import { getTimeSheet } from '../actions/timesheet';
import { closeTimeSheet, getClosingStatus } from '../actions/closing';

import { Loader2, Printer, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface EmployeeTimeSheetTabProps {
    employeeId: string;
}

export function EmployeeTimeSheetTab({ employeeId }: EmployeeTimeSheetTabProps) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [sheetData, setSheetData] = useState<{ days: any[], totalBalance: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        loadSheet();
        checkClosing();
    }, [employeeId, month, year]);

    async function loadSheet() {
        setLoading(true);
        const res = await getTimeSheet(employeeId, month, year);
        if (res.success) {
            setSheetData(res.data || null);
        }
        setLoading(false);
    }

    async function checkClosing() {
        const res = await getClosingStatus(employeeId, month + 1, year);
        setIsClosed(!!res.data);
    }

    async function handleClose() {
        if (!confirm('Deseja realmente fechar o ponto deste mês? Essa ação é irreversível.')) return;

        const balance = sheetData?.totalBalance || 0;
        const res = await closeTimeSheet(employeeId, month + 1, year, balance);

        if (res.success) {
            toast.success('Ponto fechado com sucesso!');
            setIsClosed(true);
        } else {
            toast.error(res.error || 'Erro ao fechar ponto');
        }
    }

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    function formatMinutes(mins: number) {
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex space-x-2 items-center bg-slate-50 p-2 rounded border border-slate-200">
                <select
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded px-2 py-1"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
                <select
                    className="bg-white border border-slate-300 text-slate-700 text-sm rounded px-2 py-1"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>

                <Button
                    variant="outline"
                    size="sm"
                    className="ml-2"
                    onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${employeeId}&month=${month + 1}&year=${year}`, '_blank')}
                >
                    <Printer className="h-4 w-4 mr-2" /> Imprimir
                </Button>

                {!isClosed ? (
                    <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white ml-2"
                        onClick={handleClose}
                    >
                        <Lock className="h-4 w-4 mr-2" /> Fechar Mês
                    </Button>
                ) : (
                    <span className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1.5 rounded flex items-center">
                        <Lock className="h-3 w-3 mr-1" /> FECHADO
                    </span>
                )}

                <div className="flex-1 text-right pr-4">
                    {sheetData && (
                        <span className={`font-bold ${sheetData.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            Saldo Mês: {formatMinutes(sheetData.totalBalance)}
                        </span>
                    )}
                </div>
                {loading && <Loader2 className="animate-spin h-4 w-4 text-slate-400" />}
            </div>

            {/* Grid */}
            <div className="border border-slate-200 rounded-lg overflow-hidden max-h-[400px] overflow-y-auto overflow-x-auto">
                <table className="min-w-full text-sm item-center text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 font-medium text-slate-600 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-center w-12">Dia</th>
                            <th className="px-4 py-2 w-16">Semana</th>
                            <th className="px-4 py-2">Turno</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrada</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Saída Int.</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Volta Int.</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Saída</th>
                            <th className="px-4 py-2 text-center">Saldo</th>
                            <th className="px-4 py-2 text-center w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(sheetData?.days || []).map((day: any, idx: number) => {
                            // Fix: Parse "YYYY-MM-DD" as local midday to avoid TZ shifting to previous day
                            const dateParts = day.date.toString().split('T')[0].split('-');
                            const displayDate = new Date(Number(dateParts[0]), Number(dateParts[1]) - 1, Number(dateParts[2]), 12, 0, 0);
                            const isWeekend = displayDate.getDay() === 0 || displayDate.getDay() === 6;

                            // Mock Inter-shift Check (Needs backend support for accuracy)
                            // We check if "previous day end" and "current day start" is < 11h
                            // This is complex on frontend without full previous data. 
                            // Adding logic placeholder:
                            const hasInterShiftViolation = false;

                            return (
                                <tr key={day.day} className={`hover:bg-slate-50 ${isWeekend ? 'bg-slate-50/50' : ''}`}>
                                    <td className="px-4 py-2 text-center font-bold text-slate-700">{day.day}</td>
                                    <td className={`px-4 py-2 text-xs ${isWeekend ? 'text-red-400' : 'text-slate-500'}`}>
                                        {displayDate.toLocaleDateString('pt-BR', { weekday: 'short' })}
                                    </td>
                                    <td className="px-4 py-2 text-xs text-slate-500">
                                        {day.shiftName || '-'}
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="font-mono text-sm text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            {day.punches[0] || '--:--'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="font-mono text-sm text-slate-600">
                                            {day.punches[1] || '--:--'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center">
                                        <span className="font-mono text-sm text-slate-600">
                                            {day.punches[2] || '--:--'}
                                        </span>
                                    </td>
                                    <td className="px-2 py-2 text-center relative group">
                                        <span className="font-mono text-sm text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            {day.punches[3] || '--:--'}
                                        </span>
                                        {day.punches.length > 4 && (
                                            <span className="absolute top-1 right-0 text-[10px] flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold" title={`Mais batidas: ${day.punches.slice(4).join(', ')}`}>
                                                +
                                            </span>
                                        )}
                                    </td>
                                    <td className={`px-4 py-2 text-center font-mono text-xs ${day.balanceMinutes < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        {day.balanceMinutes !== 0 ? formatMinutes(day.balanceMinutes) : '-'}
                                    </td>
                                    <td className="px-4 py-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${day.statusColor}`}>
                                            {day.status}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
