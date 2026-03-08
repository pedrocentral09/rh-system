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
                <div className="flex items-center gap-4 bg-surface/60 border border-border rounded-[2.5rem] p-2 pr-8 backdrop-blur-xl shadow-2xl overflow-hidden group">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-brand-blue/5 blur-3xl rounded-full -ml-16 -mt-16 pointer-events-none" />
                    <button
                        onClick={prevMonth}
                        className="h-14 w-14 rounded-[1.5rem] bg-text-primary/5 border border-border text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all flex items-center justify-center active:scale-90"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <div className="px-6 flex flex-col min-w-[200px]">
                        <span className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.3em] mb-1">Competência Ativa</span>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">
                            {monthNames[month]} <span className="text-brand-blue">{year}</span>
                        </h2>
                    </div>
                    <button
                        onClick={nextMonth}
                        className="h-14 w-14 rounded-[1.5rem] bg-text-primary/5 border border-border text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all flex items-center justify-center active:scale-90"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex items-center gap-6">
                    {sheetData && (
                        <div className="bg-surface/60 border border-border rounded-[2.5rem] p-6 px-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none" />
                            <div className="flex items-center gap-5 relative z-10">
                                <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Clock className="h-6 w-6 text-brand-orange" />
                                </div>
                                <div>
                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.3em] block mb-1">Saldo Liquidado</span>
                                    <div className={`text-3xl font-black tracking-tighter leading-none ${sheetData.totalBalance >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {formatMinutes(sheetData.totalBalance)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className="h-20 w-20 rounded-[2.5rem] bg-text-primary/5 border border-border text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all flex items-center justify-center shadow-2xl active:scale-95">
                        <Printer className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Daily Registry Grid */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-24 w-full rounded-[2.5rem] bg-text-primary/5 border border-border animate-pulse" />
                        ))
                    ) : sheetData?.days.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 bg-text-primary/2 rounded-[3.5rem] border border-dashed border-border backdrop-blur-3xl"
                        >
                            <FileWarning className="h-16 w-16 text-text-primary/5 mx-auto mb-6" />
                            <p className="text-text-muted font-black text-[12px] uppercase tracking-[0.4em] italic">Vácuo de Registros Detectado</p>
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
                                            "bg-surface/80 border border-border rounded-[2.5rem] p-2 transition-all duration-300 backdrop-blur-xl relative overflow-hidden flex flex-col md:flex-row shadow-xl",
                                            isToday ? "border-brand-blue/30 bg-brand-blue/[0.03] ring-1 ring-brand-blue/20" : "hover:bg-text-primary/[0.02]"
                                        )}>
                                            {/* Data Badge */}
                                            <div className={cn(
                                                "w-full md:w-32 flex flex-row md:flex-col items-center justify-between md:justify-center p-6 md:p-4 border-b md:border-b-0 md:border-r border-border relative bg-text-primary/2",
                                                isWeekend ? "text-text-muted/60" : isToday ? "text-brand-blue" : "text-text-primary"
                                            )}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-50">
                                                        {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className="text-3xl font-black tracking-tighter leading-none">{day.day.toString().padStart(2, '0')}</span>
                                                </div>
                                                {isToday && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_15px_rgba(var(--brand-blue-rgb),1)] animate-pulse" />}
                                            </div>

                                            {/* Punches Timeline */}
                                            <div className="flex-1 p-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                                                    {day.punches.length > 0 ? (
                                                        day.punches.map((p: string, i: number) => (
                                                            <div key={i} className="h-12 flex items-center px-5 bg-text-primary/5 border border-border rounded-2xl text-[13px] font-mono font-black text-text-primary group-hover:border-border transition-all shadow-inner">
                                                                {p}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-text-primary/2 border border-border border-dashed">
                                                            <div className={cn("w-2 h-2 rounded-full", isWeekend ? "bg-text-muted/20" : "bg-brand-orange/40")} />
                                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">
                                                                {day.isDayOff ? 'Folga Programada' : (day.isHoliday ? 'Feriado Nacional' : 'Inatividade Detectada')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-none border-border pt-6 md:pt-0">
                                                    {day.balanceMinutes !== 0 && (
                                                        <div className="text-right">
                                                            <span className="text-[8px] font-black text-text-muted uppercase tracking-[0.2em] block mb-1">Impacto</span>
                                                            <div className={cn(
                                                                "text-lg font-mono font-black tracking-tighter",
                                                                day.balanceMinutes < 0 ? 'text-red-500' : 'text-emerald-500'
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
                                                            "h-11 px-6 rounded-2xl bg-text-primary/5 border border-border flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-text-muted shadow-2xl",
                                                            day.statusColor?.includes('emerald') || day.statusColor?.includes('green') ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" :
                                                                day.statusColor?.includes('red') || day.statusColor?.includes('rose') ? "text-red-500 bg-red-500/10 border-red-500/20" : ""
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
            <div className="bg-surface/40 border border-border rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Info className="h-8 w-8 text-brand-blue" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="font-black text-sm uppercase tracking-tight text-text-primary mb-2">Protocolo de Integridade Digital</h4>
                        <p className="text-text-muted text-xs font-semibold leading-relaxed tracking-tight max-w-2xl">
                            Esta interface reflete os registros validados pelo RH central. Divergências devem ser tratadas via <span className="text-brand-blue underline decoration-2 underline-offset-4 cursor-help">módulo de justificativa</span> anexando evidências digitais da jornada realizada.
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
