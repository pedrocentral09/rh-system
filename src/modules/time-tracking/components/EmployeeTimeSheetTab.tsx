import { useState, useEffect } from 'react';
import { getTimeSheet } from '../actions/timesheet';
import { closeTimeSheet, getClosingStatus } from '../actions/closing';

import { Loader2, Printer, Lock, AlertTriangle, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface EmployeeTimeSheetTabProps {
    employeeId: string;
}

import { motion, AnimatePresence } from 'framer-motion';

export function EmployeeTimeSheetTab({ employeeId }: EmployeeTimeSheetTabProps) {
    const today = new Date();
    const [mounted, setMounted] = useState(false);
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());
    const [sheetData, setSheetData] = useState<{ days: any[], totalBalance: number } | null>(null);
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            loadSheet();
            checkClosing();
        }
    }, [employeeId, month, year, mounted]);

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
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Control Panel / Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-10 bg-surface border border-border/60 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-blue/5 blur-[60px] rounded-full -ml-16 -mb-16 pointer-events-none" />

                <div className="flex flex-wrap items-center gap-8 z-10">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 ml-1">
                            <Scale className="w-3.5 h-3.5 text-brand-orange opacity-60" />
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Ciclo de Apuração</label>
                        </div>
                        <div className="flex items-center gap-3">
                            <select
                                className="h-16 bg-surface-secondary border border-border rounded-2xl px-6 text-xs font-black text-text-primary uppercase tracking-widest focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all cursor-pointer shadow-sm min-w-[200px] appearance-none italic"
                                value={month}
                                onChange={(e) => setMonth(parseInt(e.target.value))}
                            >
                                {months.map((m, i) => (
                                    <option key={i} value={i} className="bg-surface">{m}</option>
                                ))}
                            </select>
                            <select
                                className="h-16 bg-surface-secondary border border-border rounded-2xl px-6 text-xs font-black text-text-primary uppercase tracking-widest focus:border-brand-orange focus:ring-4 focus:ring-brand-orange/10 transition-all cursor-pointer shadow-sm min-w-[120px] appearance-none italic"
                                value={year}
                                onChange={(e) => setYear(parseInt(e.target.value))}
                            >
                                <option value={2024} className="bg-surface">2024</option>
                                <option value={2025} className="bg-surface">2025</option>
                                <option value={2026} className="bg-surface">2026</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-16 flex items-center gap-4 mt-6 xl:mt-0">
                        <button
                            onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${employeeId}&month=${month + 1}&year=${year}`, '_blank')}
                            className="h-full px-8 rounded-2xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-primary hover:bg-surface hover:border-brand-orange/50 transition-all flex items-center gap-3 active:scale-95 shadow-sm group/btn"
                        >
                            <Printer className="h-4 w-4 text-brand-orange group-hover:scale-110 transition-transform" />
                            <span>Imprimir Espelho</span>
                        </button>

                        {!isClosed ? (
                            <button
                                onClick={handleClose}
                                className="h-full px-10 rounded-2xl bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-brand-blue/20 border-b-4 border-black/20"
                            >
                                <Lock className="h-4 w-4" />
                                <span>Encerrar Competência</span>
                            </button>
                        ) : (
                            <div className="h-full px-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-3 shadow-inner">
                                <CheckCircle className="h-4 w-4" />
                                <span>Ciclo Auditado</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="z-10 flex flex-col items-end xl:border-l xl:border-border/60 xl:pl-10">
                    {sheetData && (
                        <div className="text-right space-y-2">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] opacity-60">Saldamento Período</p>
                            <div className={`text-5xl font-black tracking-tighter italic ${sheetData.totalBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'} flex items-baseline gap-1`}>
                                {formatMinutes(sheetData.totalBalance)}
                                <span className="text-lg opacity-40 not-italic">H</span>
                            </div>
                        </div>
                    )}
                </div>
                {loading && (
                    <div className="absolute inset-0 bg-surface/40 backdrop-blur-[2px] flex items-center justify-center z-50">
                        <Loader2 className="animate-spin h-8 w-8 text-brand-orange" />
                    </div>
                )}
            </div>

            {/* Premium Grid */}
            <div className="bg-surface border border-border/60 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" />

                <div className="overflow-x-auto custom-scrollbar max-h-[700px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-secondary/50 backdrop-blur-md">
                                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center w-20 border-r border-border/40">ID</th>
                                <th className="px-6 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Competência Cronológica</th>
                                <th className="px-6 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Escala Ativa</th>
                                <th className="px-2 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center">Entrada</th>
                                <th className="px-2 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center">Intervalo</th>
                                <th className="px-2 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center">Retorno</th>
                                <th className="px-2 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center">Saída</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center border-l border-border/40">Δ Delta</th>
                                <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.3em] text-center border-l border-border/40">Parecer V2</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            <AnimatePresence mode="popLayout">
                                {(sheetData?.days || []).map((day: any, idx: number) => {
                                    const d = new Date(day.date);
                                    const displayDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
                                    const isWeekend = displayDate.getDay() === 0 || displayDate.getDay() === 6;

                                    return (
                                        <motion.tr
                                            key={`${day.day}-${idx}`}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ delay: idx * 0.01 }}
                                            className={`group hover:bg-surface-secondary/80 transition-all duration-300 ${isWeekend ? 'bg-surface-secondary/20' : ''}`}
                                        >
                                            <td className="px-10 py-5 text-center border-r border-border/20">
                                                <span className="text-base font-black text-text-primary/30 group-hover:text-brand-orange transition-colors italic">{day.day.toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-black uppercase tracking-tight italic ${isWeekend ? 'text-rose-500' : 'text-text-primary'}`}>
                                                        {mounted ? displayDate.toLocaleDateString('pt-BR', { weekday: 'long' }) : '---'}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-60">
                                                        {day.day.toString().padStart(2, '0')} • {months[month].substring(0, 3).toUpperCase()} {year}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-[10px] font-black text-text-muted uppercase tracking-widest truncate max-w-[140px] block border border-border bg-surface-secondary px-4 py-2 rounded-xl group-hover:border-brand-orange/30 transition-colors">
                                                    {day.shiftName || 'OFF-GRID'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-5 text-center">
                                                <span className={`inline-block px-4 py-2 rounded-xl text-xs font-mono font-black ${day.punches[0] ? 'bg-surface-secondary text-text-primary border border-border shadow-sm' : 'text-text-muted/10 italic'}`}>
                                                    {day.punches[0] || '---'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-5 text-center">
                                                <span className="text-xs font-mono text-text-muted font-black opacity-60 italic">{day.punches[1] || '---'}</span>
                                            </td>
                                            <td className="px-2 py-5 text-center">
                                                <span className="text-xs font-mono text-text-muted font-black opacity-60 italic">{day.punches[2] || '---'}</span>
                                            </td>
                                            <td className="px-2 py-5 text-center">
                                                <span className={`inline-block px-4 py-2 rounded-xl text-xs font-mono font-black ${day.punches[3] ? 'bg-surface-secondary text-text-primary border border-border shadow-sm' : 'text-text-muted/10 italic'}`}>
                                                    {day.punches[3] || '---'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-5 text-center border-l border-border/20">
                                                <span className={`text-sm font-mono font-black tracking-tighter italic ${day.balanceMinutes < 0 ? 'text-rose-500' : day.balanceMinutes > 0 ? 'text-emerald-500' : 'text-text-muted/10'}`}>
                                                    {day.balanceMinutes !== 0 ? formatMinutes(day.balanceMinutes) : '00:00'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-5 text-center border-l border-border/20">
                                                <div className="flex justify-center">
                                                    <span className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all ${day.status.includes('OK') || day.status.includes('Extra') ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                        day.status.includes('Falta') || day.status.includes('Incompleto') ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                                                            'bg-surface-secondary text-text-muted/50 border-border/60'
                                                        }`}>
                                                        {day.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
