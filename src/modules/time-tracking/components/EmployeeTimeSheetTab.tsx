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
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Control Panel / Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-[#0A0F1C]/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-wrap items-end gap-6 z-10">
                    <div className="space-y-2 group">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Ciclo Operacional</label>
                        <select
                            className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none min-w-[180px]"
                            value={month}
                            onChange={(e) => setMonth(parseInt(e.target.value))}
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i} className="bg-[#0A0F1C]">{m}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2 group">
                        <label className="text-[10px) font-black text-slate-500 uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Ano</label>
                        <select
                            className="h-14 bg-white/5 border border-white/5 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none min-w-[100px]"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value))}
                        >
                            <option value={2024} className="bg-[#0A0F1C]">2024</option>
                            <option value={2025} className="bg-[#0A0F1C]">2025</option>
                            <option value={2026} className="bg-[#0A0F1C]">2026</option>
                        </select>
                    </div>

                    <div className="h-14 flex items-center gap-3">
                        <button
                            onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${employeeId}&month=${month + 1}&year=${year}`, '_blank')}
                            className="h-full px-8 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Printer className="h-4 w-4 text-brand-orange" /> Exportar Auditoria
                        </button>

                        {!isClosed ? (
                            <button
                                onClick={handleClose}
                                className="h-full px-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center gap-3 active:scale-95"
                            >
                                <Lock className="h-4 w-4" /> Homologar Ciclo
                            </button>
                        ) : (
                            <div className="h-full px-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 flex items-center gap-3">
                                <CheckCircle className="h-4 w-4" /> Consolidado
                            </div>
                        )}
                    </div>
                </div>

                <div className="z-10 flex flex-col items-end">
                    {sheetData && (
                        <div className="text-right space-y-1">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] block">Saldamento Líquido</span>
                            <div className={`text-4xl font-black tracking-tighter ${sheetData.totalBalance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                {formatMinutes(sheetData.totalBalance)}<span className="text-sm ml-1 opacity-50">h</span>
                            </div>
                        </div>
                    )}
                </div>
                {loading && <Loader2 className="absolute top-8 right-10 animate-spin h-5 w-5 text-brand-orange" />}
            </div>

            {/* Premium Grid */}
            <div className="bg-[#0A0F1C]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-brand-orange/30 to-transparent" />

                <div className="overflow-x-auto custom-scrollbar max-h-[600px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-20">Índice</th>
                                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Competência</th>
                                <th className="px-4 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Escala Ativa</th>
                                <th className="px-2 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Início</th>
                                <th className="px-2 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Intervalo</th>
                                <th className="px-2 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Retorno</th>
                                <th className="px-2 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Fim</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Δ Delta</th>
                                <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Status V2</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/2">
                            <AnimatePresence mode="popLayout">
                                {(sheetData?.days || []).map((day: any, idx: number) => {
                                    const d = new Date(day.date);
                                    const displayDate = new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
                                    const isWeekend = displayDate.getDay() === 0 || displayDate.getDay() === 6;

                                    return (
                                        <motion.tr
                                            key={`${day.day}-${idx}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.005 }}
                                            className={`group hover:bg-white/[0.03] transition-all duration-300 ${isWeekend ? 'bg-white/[0.01]' : ''}`}
                                        >
                                            <td className="px-8 py-4 text-center">
                                                <span className="text-[14px] font-black text-white/40 group-hover:text-brand-orange transition-colors">{day.day.toString().padStart(2, '0')}</span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className={`text-[12px] font-black uppercase tracking-tight ${isWeekend ? 'text-red-400' : 'text-white'}`}>
                                                        {mounted ? displayDate.toLocaleDateString('pt-BR', { weekday: 'long' }) : '---'}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{day.day} {months[month].substring(0, 3)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate max-w-[120px] block border border-white/5 bg-white/[0.02] px-3 py-1 rounded-lg">
                                                    {day.shiftName || 'OFF-GRID'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <span className={`inline-block px-3 py-1.5 rounded-xl text-[12px] font-mono font-black ${day.punches[0] ? 'bg-white/5 text-white border border-white/10 shadow-inner' : 'text-slate-800'}`}>
                                                    {day.punches[0] || '--:--'}
                                                </span>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <span className="text-[11px] font-mono text-slate-600 font-black">{day.punches[1] || '--:--'}</span>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <span className="text-[11px] font-mono text-slate-600 font-black">{day.punches[2] || '--:--'}</span>
                                            </td>
                                            <td className="px-2 py-4 text-center">
                                                <span className={`inline-block px-3 py-1.5 rounded-xl text-[12px] font-mono font-black ${day.punches[3] ? 'bg-white/5 text-white border border-white/10 shadow-inner' : 'text-slate-800'}`}>
                                                    {day.punches[3] || '--:--'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[12px] font-mono font-black tracking-tighter ${day.balanceMinutes < 0 ? 'text-red-500' : day.balanceMinutes > 0 ? 'text-emerald-400' : 'text-slate-800'}`}>
                                                    {day.balanceMinutes !== 0 ? formatMinutes(day.balanceMinutes) : '00:00'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex justify-center">
                                                    <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${day.status.includes('OK') || day.status.includes('Extra') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' :
                                                        day.status.includes('Falta') || day.status.includes('Incompleto') ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' :
                                                            'bg-white/5 text-slate-600 border-white/5'
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
