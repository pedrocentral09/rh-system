'use client';

import { useState, useEffect } from 'react';
import { getBankOverview } from '../actions/timesheet'; // Ensure path is correct in file
import { Loader2 } from 'lucide-react';

export function BankOfHours() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadData();
    }, [month, year]);

    async function loadData() {
        setLoading(true);
        const res = await getBankOverview(month, year);
        if (res.success) {
            setData(res.data || []);
        }
        setLoading(false);
    }

    function formatMinutes(mins: number) {
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                <select
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded px-3 py-2"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                >
                    {months.map((m, i) => (
                        <option key={i} value={i}>{m}</option>
                    ))}
                </select>
                <select
                    className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-sm rounded px-3 py-2"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                </select>
                {loading && <Loader2 className="animate-spin text-slate-400" />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((item: any) => (
                    <div key={item.employee.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center group hover:border-indigo-100 dark:hover:border-indigo-800 transition-all">
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-200">{item.employee.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{item.employee.department}</p>
                        </div>
                        <div className={`text-lg font-mono font-bold ${item.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                            {formatMinutes(item.balance)}
                        </div>
                    </div>
                ))}
            </div>

            {data.length === 0 && !loading && (
                <div className="text-center py-10 text-slate-400">Nenhum dado calculado para este período.</div>
            )}
        </div>
    );
}
