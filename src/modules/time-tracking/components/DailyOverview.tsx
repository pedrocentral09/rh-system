'use client';

import { useState, useEffect } from 'react';
import { getDailyOverview } from '../actions/timesheet';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Loader2, RefreshCw, Scale, Pencil } from 'lucide-react';
import { TimeAdjustmentModal } from './TimeAdjustmentModal';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DailyOverview() {
    const [mounted, setMounted] = useState(false);
    const [date, setDate] = useState(''); // Start empty to avoid mismatch
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedAdjustment, setSelectedAdjustment] = useState<{ empId: string, empName: string, date: string, punches: string[] } | null>(null);

    useEffect(() => {
        setMounted(true);
        // Get Local Date but formatted as YYYY-MM-DD for the input
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        setDate(`${year}-${month}-${day}`);
    }, []);

    useEffect(() => {
        if (date && mounted) loadData();
    }, [date, mounted]);

    async function loadData() {
        setLoading(true);
        const res = await getDailyOverview(date);
        if (res.success) {
            setData(res.data || []);
        }
        setLoading(false);
    }

    function formatMinutes(mins: number) {
        if (mins === 0) return '00:00';
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    if (!mounted) return null;

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
                    <div className="pt-5 flex gap-2">
                        <Button variant="ghost" onClick={loadData} disabled={loading} className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2 text-[10px] uppercase font-bold">
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded border border-green-200">OK</span>
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded border border-yellow-200">Atraso</span>
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded border border-red-200">Falta</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded border border-purple-200">Extra</span>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded border border-amber-200">Ímpar</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-4 py-3 whitespace-nowrap">Funcionário</th>
                            <th className="px-4 py-3">Depto</th>
                            <th className="px-4 py-3">Turno</th>
                            <th className="px-2 py-3 text-center text-[10px] uppercase">Entrada</th>
                            <th className="px-2 py-3 text-center text-[10px] uppercase">S.Alm</th>
                            <th className="px-2 py-3 text-center text-[10px] uppercase">V.Alm</th>
                            <th className="px-2 py-3 text-center text-[10px] uppercase">Saída</th>
                            <th className="px-4 py-3 text-center">Saldo</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-4 py-3 text-center w-24">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {data.length === 0 && !loading && (
                            <tr>
                                <td colSpan={10} className="text-center py-12 text-slate-400">Nenhum dado encontrado para esta data.</td>
                            </tr>
                        )}
                        {data.map((item: any) => (
                            <tr key={item.employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 group transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">{item.employee.name}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{item.employee.department}</td>
                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{item.shiftName || 'Folga'}</td>
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
                                <td className="px-2 py-3 text-center relative">
                                    <span className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200 dark:border-slate-600">
                                        {item.punches[3] || '--:--'}
                                    </span>
                                    {item.punches.length > 4 && (
                                        <span className="absolute top-1 right-0 text-[9px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-100 text-red-600 font-bold border border-red-200" title={`Mais batidas: ${item.punches.slice(4).join(', ')}`}>
                                            +
                                        </span>
                                    )}
                                </td>
                                <td className={`px-4 py-3 text-center font-mono text-xs ${item.balanceMinutes < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                    {formatMinutes(item.balanceMinutes)}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.statusColor}`}>
                                        {item.status === 'MISSING' ? 'ÍMPAR' : item.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        {item.balanceMinutes < -5 && (
                                            <Link
                                                href={`/dashboard/disciplinary?action=create&empId=${item.employee.id}&date=${date}&reason=Atraso de ${Math.abs(item.balanceMinutes)} min&desc=O colaborador apresentou um atraso de ${Math.abs(item.balanceMinutes)} minutos no dia ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}.`}
                                                className="bg-red-50 hover:bg-red-100 text-red-600 p-1.5 rounded-md border border-red-100 transition-colors"
                                                title="Gerar Ato Disciplinar"
                                            >
                                                <Scale className="h-4 w-4" />
                                            </Link>
                                        )}
                                        <button
                                            onClick={() => setSelectedAdjustment({
                                                empId: item.employee.id,
                                                empName: item.employee.name,
                                                date: date,
                                                punches: item.punches
                                            })}
                                            className="bg-slate-50 hover:bg-slate-100 text-slate-600 p-1.5 rounded-md border border-slate-200 transition-colors"
                                            title="Ajustar Ponto"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                    </div>
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
                    }}
                />
            )}
        </div>
    );
}
