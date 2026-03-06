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
import { motion } from 'framer-motion';

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
        <div className="space-y-10 pb-12">
            {/* Header / Month Switcher */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-3 bg-white/[0.05] border border-white/10 rounded-[32px] p-2 w-full md:w-auto backdrop-blur-3xl shadow-xl">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="rounded-2xl h-12 w-12 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex-1 px-6 font-[1000] text-white text-sm text-center uppercase tracking-[0.2em] min-w-[180px]">
                        {monthNames[month]} <span className="text-blue-400">{year}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="rounded-2xl h-12 w-12 text-slate-400 hover:text-white hover:bg-white/10 transition-all active:scale-90">
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <Card className="flex-1 md:flex-none border border-white/10 bg-white/[0.05] text-white backdrop-blur-3xl rounded-[32px] overflow-hidden group shadow-2xl">
                        <div className="px-8 py-3.5 flex items-center gap-4">
                            <div className="p-2.5 bg-brand-orange/20 rounded-xl group-hover:scale-110 transition-transform">
                                <Clock className="h-4 w-4 text-brand-orange" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase text-slate-500 leading-none tracking-widest mb-1.5">Saldo Mensal</span>
                                <span className="text-xl font-[1000] leading-tight tracking-tighter text-white">
                                    {sheetData ? formatMinutes(sheetData.totalBalance) : '00:00'}
                                </span>
                            </div>
                        </div>
                    </Card>
                    <Button variant="ghost" className="h-auto px-8 rounded-[32px] bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest transition-all backdrop-blur-md">
                        <Printer className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Timesheet List */}
            <div className="space-y-4">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-24 w-full rounded-[36px] bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))
                ) : sheetData?.days.length === 0 ? (
                    <div className="text-center py-24 bg-white/[0.02] rounded-[48px] border border-dashed border-white/10 backdrop-blur-3xl">
                        <FileWarning className="h-14 w-14 text-white/5 mx-auto mb-6" />
                        <p className="text-slate-500 font-[1000] text-xs uppercase tracking-[0.3em]">Nenhum registro</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {sheetData.days.map((day: any) => {
                            const date = new Date(day.date);
                            const isWeekend = date.getUTCDay() === 0 || date.getUTCDay() === 6;
                            const hasProblem = day.status === 'ABSENT' || day.status === 'DELAY' || day.status === 'MISSING';
                            const isToday = new Date().toISOString().split('T')[0] === new Date(day.date).toISOString().split('T')[0];

                            return (
                                <motion.div key={day.day} whileTap={{ scale: 0.99 }}>
                                    <Card className={cn(
                                        "border border-white/5 shadow-2xl overflow-hidden group rounded-[40px] transition-all backdrop-blur-3xl",
                                        isToday ? "bg-white/[0.08] ring-2 ring-blue-500/30 border-blue-500/20" :
                                            isWeekend ? "bg-white/[0.01] opacity-60" : "bg-white/[0.03] hover:bg-white/[0.05]"
                                    )}>
                                        <div className="flex flex-col sm:flex-row min-h-[100px]">
                                            {/* Date Section */}
                                            <div className={cn(
                                                "sm:w-28 flex sm:flex-col items-center justify-center p-6 sm:p-2 border-b sm:border-b-0 sm:border-r border-white/5",
                                                isWeekend ? "text-slate-500" : isToday ? "text-blue-400" : "text-slate-300 group-hover:text-white transition-colors"
                                            )}>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-[1000] uppercase tracking-[0.2em] mb-1 opacity-70">
                                                        {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')}
                                                    </span>
                                                    <span className="text-3xl font-[1000] tracking-tighter leading-none">{day.day}</span>
                                                </div>
                                                {isToday && <div className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] sm:mt-3 ml-4 sm:ml-0" />}
                                            </div>

                                            {/* Content Area */}
                                            <div className="flex-1 p-6 flex flex-col justify-center">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                    {/* Punches Grid */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {day.punches.length > 0 ? (
                                                            day.punches.map((p: string, i: number) => (
                                                                <div key={i} className="bg-white/5 text-white font-[1000] text-[12px] px-4 py-2 rounded-2xl border border-white/10 hover:border-blue-400/50 transition-colors shadow-inner">
                                                                    {p}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-white/[0.01]">
                                                                <div className={cn("w-1.5 h-1.5 rounded-full", day.isDayOff ? "bg-slate-700" : "bg-brand-orange/50")} />
                                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                                                                    {day.isDayOff ? 'Folga' : (day.isHoliday ? 'Feriado' : 'Sem registros')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Balance & Status */}
                                                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-5 sm:pt-0 border-t sm:border-none border-white/5">
                                                        {day.balanceMinutes !== 0 && (
                                                            <div className={cn(
                                                                "text-xs font-[1000] tracking-widest uppercase px-4 py-2 rounded-2xl border backdrop-blur-md",
                                                                day.balanceMinutes < 0
                                                                    ? 'text-rose-400 bg-rose-400/10 border-rose-400/20'
                                                                    : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20'
                                                            )}>
                                                                {formatMinutes(day.balanceMinutes)}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-3">
                                                            {hasProblem && !day.isDayOff && !day.isHoliday && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-10 rounded-2xl text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 font-black text-[10px] uppercase tracking-widest gap-2 px-5 border border-brand-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.2)] active:scale-95"
                                                                    onClick={() => handleJustify(day.date)}
                                                                >
                                                                    <Camera className="h-4 w-4" /> Justificar
                                                                </Button>
                                                            )}

                                                            <div className={cn(
                                                                "text-[9px] font-[1000] uppercase pt-1.5 pb-2 px-3 h-auto rounded-xl tracking-widest border shadow-2xl",
                                                                day.statusColor ? `bg-opacity-10 border-opacity-30 ${day.statusColor.replace('bg-', 'text-').replace('text-slate-100', 'text-slate-400')}` : "bg-white/5 text-slate-500 border-white/10"
                                                            )}>
                                                                {day.status}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-white/[0.03] border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl shadow-2xl flex items-start gap-5">
                <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-400/20">
                    <Info className="h-6 w-6" />
                </div>
                <div>
                    <h4 className="font-[1000] text-xs uppercase tracking-[0.2em] text-white mb-2 underline decoration-blue-500 decoration-2 underline-offset-4">Controle de Jornada Digital</h4>
                    <p className="text-slate-400 text-xs font-semibold leading-relaxed tracking-tight">
                        Sua jornada oficial é registrada pelo terminal físico. Os dados exibidos nesta plataforma são <span className="text-white">atualizados periodicamente</span>. Se houver divergências persistentes, anexe seu comprovante na ferramenta de justificativa ou procure o RH.
                    </p>
                </div>
            </div>

            {selectedDate && (
                <TimeJustificationModal
                    isOpen={isJustifyModalOpen}
                    onClose={() => setIsJustifyModalOpen(false)}
                    date={selectedDate}
                    onSuccess={() => loadData()}
                />
            )}
        </div>
    );
}
