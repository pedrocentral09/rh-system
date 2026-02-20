'use client';

import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

export function VacationCalendar({ vacations }: { vacations: any[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Ensure vacations is an array
    const safeVacations = Array.isArray(vacations) ? vacations : [];

    const getVacationsForDay = (day: Date) => {
        return safeVacations.filter(v =>
            isWithinInterval(day, {
                start: new Date(v.startDate),
                end: new Date(v.endDate)
            })
        );
    };

    return (
        <Card className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/60 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-50 dark:border-slate-800/60">
                <CardTitle className="text-sm font-black text-[#001B3D] dark:text-white uppercase tracking-tight">
                    Calendário de Férias
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="flex border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none border-r dark:border-slate-800 dark:hover:bg-slate-900" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                            ◀
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none dark:hover:bg-slate-900" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                            ▶
                        </Button>
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest min-w-[120px] text-center text-slate-600 dark:text-zinc-300">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500 bg-slate-50/50 dark:bg-slate-900/50 py-2 border-b dark:border-slate-800/60">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-px bg-slate-100 dark:bg-slate-800/60 transition-all">
                    {/* Padding for start of month */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`pad-${i}`} className="h-28 bg-slate-50/30 dark:bg-slate-900/30"></div>
                    ))}

                    {days.map(day => {
                        const dayVacations = getVacationsForDay(day);
                        const isToday = isSameDay(day, new Date());
                        return (
                            <div key={day.toString()} className={`h-28 p-1.5 bg-white dark:bg-slate-950 overflow-hidden relative group transition-colors ${isToday ? 'bg-indigo-50/10 dark:bg-indigo-950/20' : ''}`}>
                                <div className={`text-[10px] font-black mb-1.5 ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-zinc-600'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayVacations.map(v => (
                                        <div key={v.id}
                                            className="text-[9px] font-bold bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 px-1.5 py-0.5 rounded-md truncate border border-sky-200/50 dark:border-sky-800/40 shadow-sm"
                                            title={`${v.employee.name} (Até ${format(new Date(v.endDate), 'dd/MM')})`}
                                        >
                                            {v.employee.name.split(' ')[0]}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
