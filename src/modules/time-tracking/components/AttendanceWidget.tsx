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

    const workingTotal = stats.total - stats.dayOff;
    const chartTotal = workingTotal > 0 ? workingTotal : 1;

    const pPresent = (stats.present / chartTotal) * 100;
    const pLate = (stats.late / chartTotal) * 100;
    const pAbsent = (stats.absent / chartTotal) * 100;

    const circumference = 2 * Math.PI * 40;
    const rotLate = (pPresent / 100) * 360;
    const rotAbsent = ((pPresent + pLate) / 100) * 360;

    return (
        <div className="relative group overflow-hidden bg-surface border border-border rounded-[2rem] p-8 shadow-2xl h-full">
            {/* Background Decorative Element */}
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-500/5 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Monitor de Presença</h3>
                        </div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Fluxo <span className="text-brand-orange">Operacional</span></h2>
                    </div>

                    <div className="text-right">
                        <div className="text-4xl font-black text-text-primary tracking-tighter leading-none mb-1">
                            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[9px] font-black text-brand-orange uppercase tracking-[0.2em]">Live Analytics</div>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row items-center gap-12 flex-1">
                    {/* Donut Chart with Effects */}
                    <div className="relative w-48 h-48 flex-shrink-0">
                        <div className="absolute inset-0 bg-surface-secondary rounded-full blur-xl scale-90" />
                        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" className="stroke-border" strokeWidth="8" fill="none" />

                            {stats.present > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#10b981" strokeWidth="10" fill="none"
                                    strokeDasharray={`${(pPresent / 100) * circumference} ${circumference}`}
                                    strokeLinecap="round"
                                />
                            )}
                            {stats.late > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#f59e0b" strokeWidth="10" fill="none"
                                    strokeDasharray={`${(pLate / 100) * circumference} ${circumference}`}
                                    transform={`rotate(${rotLate} 50 50)`}
                                    strokeLinecap="round"
                                />
                            )}
                            {stats.absent > 0 && (
                                <circle
                                    cx="50" cy="50" r="40"
                                    stroke="#f43f5e" strokeWidth="10" fill="none"
                                    strokeDasharray={`${(pAbsent / 100) * circumference} ${circumference}`}
                                    transform={`rotate(${rotAbsent} 50 50)`}
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                            <span className="text-5xl font-black text-text-primary tracking-tighter leading-none">{Math.round(pPresent || 0)}</span>
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">% EFETIVO</span>
                        </div>
                    </div>

                    {/* Elite Stats Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 gap-4">
                        <StatusCard label="Presentes" value={stats.present} color="text-emerald-500" bg="bg-emerald-500/10 border-emerald-500/20" dot="bg-emerald-500" />
                        <StatusCard label="Incidências" value={stats.late} color="text-amber-500" bg="bg-amber-500/10 border-amber-500/20" dot="bg-amber-500" />
                        <StatusCard label="Ausências" value={stats.absent} color="text-rose-500" bg="bg-rose-500/10 border-rose-500/20" dot="bg-rose-500" />
                        <StatusCard label="Descansos" value={stats.dayOff} color="text-text-muted" bg="bg-surface-secondary border-border" dot="bg-text-muted" />
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-text-muted">
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-8 bg-surface-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-brand-orange w-1/3 animate-shimmer" />
                        </div>
                        <span>Processamento Geral: {stats.total} IDs</span>
                    </div>
                    <span className="text-text-muted italic">Atualizado agora</span>
                </div>
            </div>
        </div>
    );
}

function StatusCard({ label, value, color, bg, dot }: { label: string, value: number, color: string, bg: string, dot: string }) {
    return (
        <div className={`p-4 rounded-3xl transition-all duration-300 border hover:border-brand-orange/30 group/card ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`h-1.5 w-1.5 rounded-full ${dot} shadow-[0_0_5px_currentColor]`} />
                <p className="text-[9px] text-text-muted font-black uppercase tracking-widest group-hover/card:text-text-secondary transition-colors">{label}</p>
            </div>
            <p className={`text-2xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
    );
}
