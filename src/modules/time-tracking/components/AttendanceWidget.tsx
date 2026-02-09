'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

interface AttendanceStats {
    total: number;
    present: number;
    late: number;
    absent: number;
    dayOff: number;
}

export function AttendanceWidget({ overview }: { overview: any[] }) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Calculate Stats
    const stats: AttendanceStats = {
        total: overview.length,
        present: overview.filter(x => x.status === 'OK' || x.status === 'EXTRA').length,
        late: overview.filter(x => x.status === 'DELAY' || x.status === 'MISSING').length,
        absent: overview.filter(x => x.status === 'ABSENT').length,
        dayOff: overview.filter(x => x.status === 'DAY_OFF').length
    };

    // Filter out day offs for the chart percentages calculation (usually we care about working people)
    const workingTotal = stats.total - stats.dayOff;
    const chartTotal = workingTotal > 0 ? workingTotal : 1; // Prevent div by zero

    // Calculate Percentages for Donut
    // Order: Present (Green) -> Late (Yellow) -> Absent (Red)
    const pPresent = (stats.present / chartTotal) * 100;
    const pLate = (stats.late / chartTotal) * 100;
    const pAbsent = (stats.absent / chartTotal) * 100;

    // SVG Dash Array Logic (Cumulative)
    const circumference = 2 * Math.PI * 40; // r=40

    // Offsets
    // Green starts at -90deg (top)
    const offPresent = circumference - (pPresent / 100) * circumference;
    const offLate = circumference - (pLate / 100) * circumference;
    const offAbsent = circumference - (pAbsent / 100) * circumference;

    // Rotation for segments
    // Green starts at 0 (visually -90 via transform)
    // Late starts after Green
    const rotLate = (pPresent / 100) * 360;
    // Absent starts after Green + Late
    const rotAbsent = ((pPresent + pLate) / 100) * 360;


    return (
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <span className="text-9xl">⏰</span>
            </div>

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl text-slate-800 dark:text-white flex items-center gap-2">
                            Pontualidade Hoje
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">{time.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</CardDescription>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-xs text-indigo-400 dark:text-indigo-300 font-medium animate-pulse">
                            tempo real
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="flex flex-col md:flex-row items-center gap-8 mt-4">

                    {/* Donut Chart */}
                    <div className="relative w-40 h-40 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            {/* Background Circle */}
                            <circle cx="50" cy="50" r="40" className="stroke-slate-100 dark:stroke-slate-700" strokeWidth="12" fill="none" />

                            {/* Segments - Only render if > 0 */}
                            {stats.present > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#22c55e" strokeWidth="12" fill="none"
                                    strokeDasharray={`${(pPresent / 100) * circumference} ${circumference}`}
                                />
                            )}
                            {stats.late > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#eab308" strokeWidth="12" fill="none"
                                    strokeDasharray={`${(pLate / 100) * circumference} ${circumference}`}
                                    transform={`rotate(${rotLate} 50 50)`}
                                />
                            )}
                            {stats.absent > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#ef4444" strokeWidth="12" fill="none"
                                    strokeDasharray={`${(pAbsent / 100) * circumference} ${circumference}`}
                                    transform={`rotate(${rotAbsent} 50 50)`}
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col">
                            <span className="text-3xl font-bold text-slate-700 dark:text-white">{Math.round(pPresent || 0)}%</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase">Presentes</span>
                        </div>
                    </div>

                    {/* Stats Legend */}
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800">
                            <p className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Presentes</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.present}</p>
                        </div>

                        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
                            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-bold uppercase mb-1">Atrasos/Inc.</p>
                            <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.late}</p>
                        </div>

                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                            <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase mb-1">Ausentes</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.absent}</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-slate-100 dark:border-slate-600 opacity-70">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase mb-1">Folgas</p>
                            <p className="text-2xl font-bold text-slate-600 dark:text-slate-300">{stats.dayOff}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Insight */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 text-center">
                    {stats.absent === 0 && stats.late === 0 ? (
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">✨ Equipe completa e pontual hoje!</p>
                    ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Previsão de presença: <span className="font-bold text-slate-700 dark:text-slate-200">{workingTotal} colaboradores</span>
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
