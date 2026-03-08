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
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Header/Filter Control */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-surface/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-8 z-10 w-full md:w-auto">
                    <div className="space-y-2 group w-full md:w-auto">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Período de Referência</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="h-14 bg-surface-secondary border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all shadow-inner w-full md:w-48 appearance-none"
                            />
                        </div>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="h-14 w-14 rounded-2xl bg-surface-secondary border border-border flex items-center justify-center text-text-muted hover:text-brand-orange hover:bg-surface-hover transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-auto md:mt-6"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 text-brand-orange" /> : <RefreshCw className="h-5 w-5" />}
                    </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 z-10">
                    {[
                        { label: 'OK', color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' },
                        { label: 'Atraso', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
                        { label: 'Falta', color: 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20' },
                        { label: 'Extra', color: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' },
                        { label: 'Ímpar', color: 'bg-surface-secondary text-text-muted border-border' }
                    ].map(st => (
                        <span key={st.label} className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${st.color}`}>
                            {st.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Premium Data List */}
            <div className="space-y-4">
                <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                    <div className="col-span-3 text-left">Colaborador / Departamento</div>
                    <div className="col-span-2 text-center">Jornada</div>
                    <div className="col-span-3 text-center">Registros de Ponto</div>
                    <div className="col-span-1 text-center">Saldo</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-2 text-right">Controle</div>
                </div>

                <div className="space-y-3">
                    {data.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-700 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                            <Scale className="h-12 w-12 mb-6 opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-center">Nenhum evento localizado para este ciclo</p>
                        </div>
                    )}

                    {data.map((item: any, i: number) => (
                        <motion.div
                            key={item.employee.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="bg-surface border border-border rounded-[1.5rem] px-8 py-5 grid grid-cols-12 items-center hover:border-brand-orange/30 hover:bg-surface-hover transition-all duration-300 group"
                        >
                            <div className="col-span-3 flex flex-col gap-0.5">
                                <h4 className="text-[13px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">{item.employee.name}</h4>
                                <span className="text-[9px] font-bold text-text-muted uppercase tracking-widest">{item.employee.department}</span>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className="bg-surface-secondary text-text-muted px-2 py-1 rounded text-[8px] font-black uppercase tracking-tighter border border-border">{item.shiftName || 'FOLGA'}</span>
                            </div>

                            <div className="col-span-3">
                                <div className="flex items-center justify-center gap-3">
                                    {item.punches.slice(0, 4).map((p: string, idx: number) => (
                                        <div key={idx} className="flex flex-col items-center gap-1">
                                            <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{['ENT', 'ALM', 'VOL', 'SAI'][idx]}</span>
                                            <span className={`text-[11px] font-mono font-black ${p ? 'text-text-primary' : 'text-text-muted/30 dark:text-slate-700'}`}>
                                                {p || '--:--'}
                                            </span>
                                        </div>
                                    ))}
                                    {item.punches.length > 4 && (
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[10px] font-black text-red-400" title={`Multiplus: ${item.punches.slice(4).join(', ')}`}>
                                            +{item.punches.length - 4}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="col-span-1 text-center">
                                <div className={`inline-block px-3 py-1.5 rounded-xl border font-mono text-[11px] font-black ${item.balanceMinutes < 0 ? 'bg-red-500/5 text-red-500 border-red-500/10' : 'bg-emerald-500/5 text-emerald-500 border-emerald-500/10'}`}>
                                    {formatMinutes(item.balanceMinutes)}
                                </div>
                            </div>

                            <div className="col-span-1 text-center">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter border ${item.statusColor}`}>
                                    {item.status === 'MISSING' ? 'ÍMPAR' : item.status}
                                </span>
                            </div>

                            <div className="col-span-2 flex justify-end gap-3 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
                                {item.balanceMinutes < -5 && (
                                    <Link
                                        href={`/dashboard/disciplinary?action=create&empId=${item.employee.id}&date=${date}&reason=Atraso de ${Math.abs(item.balanceMinutes)} min&desc=O colaborador apresentou um atraso de ${Math.abs(item.balanceMinutes)} minutos no dia ${new Date(date + 'T12:00:00').toLocaleDateString('pt-BR')}.`}
                                        className="w-10 h-10 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-95"
                                        title="Ato Disciplinar"
                                    >
                                        <Scale className="h-5 w-5" />
                                    </Link>
                                )}
                                <button
                                    onClick={() => setSelectedAdjustment({
                                        empId: item.employee.id,
                                        empName: item.employee.name,
                                        date: date,
                                        punches: item.punches
                                    })}
                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all shadow-lg active:scale-95"
                                    title="Ajustar Batida"
                                >
                                    <Pencil className="h-5 w-5" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
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
