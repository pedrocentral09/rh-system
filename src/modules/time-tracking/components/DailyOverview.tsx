'use client';

import { useState, useEffect } from 'react';
import { getDailyOverview } from '../actions/timesheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Loader2, RefreshCw } from 'lucide-react';
import { TimeAdjustmentModal } from './TimeAdjustmentModal';

export function DailyOverview() {
    const [mounted, setMounted] = useState(false);
    const [date, setDate] = useState(''); // Start empty to avoid mismatch
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedAdjustment, setSelectedAdjustment] = useState<{ empId: string, empName: string, date: string, punches: string[] } | null>(null);

    useEffect(() => {
        setMounted(true);
        setDate(new Date().toISOString().split('T')[0]);
    }, []);

    useEffect(() => {
        if (date) loadData();
    }, [date]);

    async function loadData() {
        setLoading(true);
        const res = await getDailyOverview(date); // Pass string directly "YYYY-MM-DD"
        if (res.success) {
            setData(res.data || []);
        }
        setLoading(false);
    }

    function formatMinutes(mins: number) {
        if (!mins) return '-';
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block">Data de Visualização</label>
                        <Input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="w-40 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div className="pt-5">
                        <Button variant="ghost" onClick={loadData} disabled={loading} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded border border-green-200 dark:border-green-800">OK</span>
                    <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded border border-yellow-200 dark:border-yellow-800">Atraso</span>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded border border-red-200 dark:border-red-800">Falta</span>
                    <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded border border-purple-200 dark:border-purple-800">Extra</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3">Funcionário</th>
                            <th className="px-4 py-3">Depto</th>
                            <th className="px-4 py-3">Turno</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Entrada</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Saída Int.</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Volta Int.</th>
                            <th className="px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Saída</th>
                            <th className="px-4 py-3 text-center">Saldo</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center w-10">Opções</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {data.length === 0 && !loading && (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">Nenhum dado encontrado para esta data.</td>
                            </tr>
                        )}
                        {data.map((item: any) => (
                            <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{item.employee.name}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.employee.department}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{item.shiftName || 'Folga'}</td>
                                <td className="px-2 py-3 text-center">
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
                                        {item.punches[0] || '--:--'}
                                    </span>
                                </td>
                                <td className="px-2 py-3 text-center">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                                        {item.punches[1] || '--:--'}
                                    </span>
                                </td>
                                <td className="px-2 py-3 text-center">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                                        {item.punches[2] || '--:--'}
                                    </span>
                                </td>
                                <td className="px-2 py-3 text-center relative group">
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
                                        {item.punches[3] || '--:--'}
                                    </span>
                                    {item.punches.length > 4 && (
                                        <span className="absolute top-1 right-0 text-[10px] flex h-4 w-4 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold" title={`Mais batidas: ${item.punches.slice(4).join(', ')}`}>
                                            +
                                        </span>
                                    )}
                                </td>
                                <td className={`px-4 py-3 text-center font-mono ${item.balanceMinutes < 0 ? 'text-red-500 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {formatMinutes(item.balanceMinutes)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.statusColor}`}>
                                        {item.status === 'MISSING' ? 'ÍMPAR' : item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <button
                                        onClick={() => setSelectedAdjustment({
                                            empId: item.employee.id,
                                            empName: item.employee.name,
                                            date: date,
                                            punches: item.punches
                                        })}
                                        className="text-slate-400 hover:text-indigo-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Ajustar Ponto"
                                    >
                                        ✏️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedAdjustment && (
                <TimeAdjustmentModal
                    isOpen={!!selectedAdjustment}
                    onClose={() => setSelectedAdjustment(null)}
                    employeeId={selectedAdjustment.empId}
                    employeeName={selectedAdjustment.empName}
                    date={selectedAdjustment.date}
                    currentPunches={selectedAdjustment.punches}
                    onSuccess={() => {
                        loadData();
                        // Maybe show toast?
                    }}
                />
            )}
        </div>
    );
}
