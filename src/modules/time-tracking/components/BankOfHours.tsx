'use client';

import { useState, useEffect } from 'react';
import { getBankOverview } from '../actions/timesheet'; // Ensure path is correct in file
import { Loader2 } from 'lucide-react';

import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Header/Control */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col gap-2 z-10">
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Custódia de Horas (Banco)</h2>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Visão Consolidada de Ativos e Passivos Temporais</p>
                </div>

                <div className="flex items-center gap-4 z-10">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-4">Competência</label>
                        <select
                            className="h-12 bg-surface-secondary border border-border rounded-xl px-4 text-[10px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i} className="bg-surface">{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-4">Ano</label>
                        <select
                            className="h-12 bg-surface-secondary border border-border rounded-xl px-4 text-[10px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            <option value={2024} className="bg-surface">2024</option>
                            <option value={2025} className="bg-surface">2025</option>
                            <option value={2026} className="bg-surface">2026</option>
                        </select>
                    </div>
                    {loading && <Loader2 className="animate-spin text-brand-orange h-5 w-5 mt-4" />}
                </div>
            </div>

            {/* Premium Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {data.map((item: any, i: number) => (
                        <motion.div
                            key={item.employee.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-surface border border-border rounded-[2rem] p-8 flex justify-between items-center group hover:border-brand-orange/30 hover:bg-surface-secondary transition-all duration-500 shadow-xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-brand-orange/5 transition-colors" />

                            <div className="relative z-10 flex flex-col gap-1">
                                <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors">{item.employee.name}</h4>
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.employee.department}</span>
                            </div>

                            <div className="relative z-10 text-right">
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] block mb-1">Saldo Atual</span>
                                <div className={`text-xl font-mono font-black tracking-tighter ${item.balance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                    {formatMinutes(item.balance)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {data.length === 0 && !loading && (
                    <div className="col-span-full py-32 text-center bg-white/2 rounded-[2.5rem] border border-white/5 border-dashed">
                        <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic mb-2">Ausência de Registros</p>
                        <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest">Nenhum dado consolidado no vácuo de {months[month]}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
