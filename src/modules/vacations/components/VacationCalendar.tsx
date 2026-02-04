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
        <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-white">
                    Calendário de Férias
                </CardTitle>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                        ◀
                    </Button>
                    <span className="text-sm font-medium pt-2 w-32 text-center text-slate-600 dark:text-slate-300">
                        {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                    </span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                        ▶
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-500 mb-2">
                    <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {/* Padding for start of month (simple implementation, assume starts correctly for now or fix later with getDay) */}
                    {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                        <div key={`pad-${i}`} className="h-24 bg-slate-50/50"></div>
                    ))}

                    {days.map(day => {
                        const dayVacations = getVacationsForDay(day);
                        return (
                            <div key={day.toString()} className="h-24 border border-slate-100 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 overflow-hidden relative group hover:border-indigo-200 transition-colors">
                                <div className={`text-xs font-bold mb-1 ${isSameDay(day, new Date()) ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {format(day, 'd')}
                                </div>
                                <div className="space-y-1">
                                    {dayVacations.map(v => (
                                        <div key={v.id}
                                            className="text-[10px] bg-sky-100 text-sky-800 px-1 py-0.5 rounded truncate border border-sky-200"
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
