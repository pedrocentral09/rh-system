'use client';

import { useState, useEffect } from 'react';
import { getTimeSheet } from '../actions/timesheet';
import {
    Clock,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileWarning,
    CheckCircle2,
    Camera,
    Printer,
    Info
} from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/lib/utils';

import { TimeJustificationModal } from './TimeJustificationModal';
import { motion, AnimatePresence } from 'framer-motion';

interface PortalProps {
    employeeId: string;
}

export function EmployeeTimeSheetPortal({ employeeId }: PortalProps) {
    const today = new Date();
    const [month, setMonth] = useState(today.getUTCMonth());
    const [year, setYear] = useState(today.getUTCFullYear());
    const [sheetData, setSheetData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [isJustifyModalOpen, setIsJustifyModalOpen] = useState(false);

    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    useEffect(() => {
        loadData();
    }, [employeeId, month, year]);

    async function loadData() {
        setLoading(true);
        const res = await getTimeSheet(employeeId, month, year);
        if (res.success) {
            setSheetData(res.data);
        }
        setLoading(false);
    }

    const nextMonth = () => {
        if (month === 11) {
            setMonth(0);
            setYear(year + 1);
        } else {
            setMonth(month + 1);
        }
    };

    const prevMonth = () => {
        if (month === 0) {
            setMonth(11);
            setYear(year - 1);
        } else {
            setMonth(month - 1);
        }
    };

    function formatMinutes(mins: number) {
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '+';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    }

    const handleJustify = (date: string) => {
        setSelectedDate(date);
        setIsJustifyModalOpen(true);
    };

    return (
        <div className="space-y-12 pb-20 animate-in fade-in duration-700">
            {/* Elite Sub-Header/Switcher */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
                <div className="flex items-center gap-4 bg-[#0A0F1C]/60 border border-white/5 rounded-[2.5rem] p-2 pr-8 backdrop-blur-xl shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -ml-16 -mt-16 pointer-events-none" />
                    <button
                        onClick={prevMonth}
                        className="h-14 w-14 rounded-[1.5rem] bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="px-6 flex flex-col min-w-[200px]">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Competência Ativa</span>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">
                            {monthNames[month]} <span className="text-blue-500">{year}</span>
                        </h2>
                    </div>
                    <button
                        onClick={nextMonth}
                        className="h-14 w-14 rounded-[1.5rem] bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center active:scale-90"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    {sheetData && (
                        <div className="bg-[#0A0F1C]/60 border border-white/5 rounded-[2.5rem] p-6 px-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none" />
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6 text-brand-orange" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] block mb-1">Saldo Liquidado</span>
                                    <div className={`text-3xl font-black tracking-tighter leading-none ${sheetData.totalBalance >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                                        {formatMinutes(sheetData.totalBalance)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="h-20 w-20 rounded-[2.5rem] bg-white/5 border border-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center shadow-2xl active:scale-95">
                        <Printer className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Daily Registry Grid */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-24 w-full rounded-[2.5rem] bg-white/5 border border-white/5 animate-pulse" />
                        ))
                    ) : sheetData?.days.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 bg-white/2 rounded-[3.5rem] border border-dashed border-white/10 backdrop-blur-3xl"
                        >
                            <FileWarning className="h-16 w-16 text-white/5 mx-auto mb-6" />
                            <p className="text-slate-600 font-black text-[12px] uppercase tracking-[0.4em] italic">Vácuo de Registros Detectado</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {sheetData.days.map((day: any, idx: number) => {
                                const date = new Date(day.date);
                                const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
                                const hasProblem = day.status === 'ABSENT' || day.status === 'DELAY' || day.status === 'MISSING';
                                const isToday = new Date().toISOString().split('T')[0] === new Date(day.date).toISOString().split('T')[0];

                                return (
                                    <motion.div
                                        key={day.day}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.01 }}
                                        whileHover={{ x: 5 }}
                                        className="group"
                                    >
                                        <div className={cn(
                                            "bg-[#0A0F1C]/80 border border-white/5 rounded-[2.5rem] p-2 transition-all duration-300 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row shadow-xl",
                                            isToday ? "border-blue-500/30 bg-blue-500/[0.03] ring-1 ring-blue-500/20" : "hover:bg-white/5"
                                        )}>
                                            {/* Data Badge */}
                                            <div className={cn(
                                                "w-full md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center p-6 md:p-4 border-b md:border-b-0 md:border-r border-white/5 relative bg-white/[0.02]",
                                                isWeekend ? "text-slate-600" : isToday ? "text-blue-400" : "text-white"
                                            )}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">
                                                        {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className="text-3xl font-black tracking-tighter leading-none">{day.day.toString().padStart(2, '0')}</span>
                                                </div>
                                                {isToday && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)] animate-pulse" />}
                                            </div>

                                            {/* Punches Timeline */}
                                            <div className="flex-1 p-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                                    {day.punches.length > 0 ? (
                                                        day.punches.map((p: string, i: number) => (
                                                            <div key={i} className="h-12 flex items-center px-5 bg-white/5 border border-white/5 rounded-2xl text-[13px] font-mono font-black text-white group-hover:border-white/20 transition-all shadow-inner">
                                                                {p}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/2 border border-white/2 border-dashed">
                                                            <div className={cn("w-2 h-2 rounded-full", isWeekend ? "bg-slate-800" : "bg-brand-orange/40")} />
                                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                                                                {day.isDayOff ? 'Folga Programada' : (day.isHoliday ? 'Feriado Nacional' : 'Inatividade Detectada')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-none border-white/5 pt-6 md:pt-0">
                                                    {day.balanceMinutes !== 0 && (
                                                        <div className="text-right">
                                                            <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em] block mb-1">Impacto</span>
                                                            <div className={cn(
                                                                "text-lg font-mono font-black tracking-tighter",
                                                                day.balanceMinutes < 0 ? 'text-red-500' : 'text-emerald-400'
                                                            )}>
                                                                {formatMinutes(day.balanceMinutes)}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex-1 md:flex-none flex items-center justify-end gap-3">
                                                        {hasProblem && !day.isDayOff && !day.isHoliday && (
                                                            <button
                                                                onClick={() => handleJustify(day.date)}
                                                                className="h-11 px-6 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[9px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                                            >
                                                                <Camera className="h-4 w-4" /> Justificar
                                                            </button>
                                                        )}
                                                        <div className={cn(
                                                            "h-11 px-6 rounded-2xl bg-white/5 border border-white/5 flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-2xl",
                                                            day.statusColor?.includes('emerald') || day.statusColor?.includes('green') ? "text-emerald-400 bg-emerald-500/5 border-emerald-500/10" :
                                                                day.statusColor?.includes('red') || day.statusColor?.includes('rose') ? "text-red-400 bg-red-500/5 border-red-500/10" : ""
                                                        )}>
                                                            {day.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Professional Footnote */}
            <div className="bg-[#0A0F1C]/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Info className="h-8 w-8 text-blue-400" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-black text-sm uppercase tracking-tight text-white mb-2">Protocolo de Integridade Digital</h4>
                        <p className="text-slate-400 text-xs font-semibold leading-relaxed tracking-tight max-w-2xl">
                            Esta interface reflete os registros validados pelo RH central. Divergências devem ser tratadas via <span className="text-blue-400 underline decoration-2 underline-offset-4 cursor-help">módulo de justificativa</span> anexando evidências digitais da jornada realizada.
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {selectedDate && (
                    <TimeJustificationModal
                        isOpen={isJustifyModalOpen}
                        onClose={() => setIsJustifyModalOpen(false)}
                        date={selectedDate}
                        onSuccess={() => loadData()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
