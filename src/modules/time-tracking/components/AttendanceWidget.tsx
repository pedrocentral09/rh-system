'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
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

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="relative group overflow-hidden bg-surface border border-border rounded-[2.5rem] p-10 shadow-2xl h-full"
        >
            {/* Background Decorative Element */}
            <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-emerald-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -right-10 -top-10 w-64 h-64 bg-brand-orange/[0.03] blur-[100px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-10">
                    <motion.div variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <h3 className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em] italic">Monitor de Operações</h3>
                        </div>
                        <h2 className="text-4xl font-[1000] text-text-primary uppercase tracking-tighter italic">Fluxo <span className="text-slate-400">Tempo Real</span></h2>
                    </motion.div>

                    <motion.div variants={{ hidden: { opacity: 0, x: 20 }, show: { opacity: 1, x: 0 } }} className="text-right">
                        <div className="text-5xl font-[1000] text-text-primary tracking-tighter leading-none mb-1 italic">
                            {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] flex items-center justify-end gap-2">
                            <div className="h-1 w-1 rounded-full bg-brand-orange animate-pulse" />
                            Live Analytics
                        </div>
                    </motion.div>
                </div>

                <div className="flex flex-col xl:flex-row items-center gap-16 flex-1">
                    {/* Donut Chart with Effects */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="relative w-64 h-64 flex-shrink-0 group/donut"
                    >
                        <div className="absolute inset-0 bg-brand-orange/5 rounded-full blur-3xl scale-90 opacity-0 group-hover/donut:opacity-100 transition-opacity duration-700" />
                        <svg className="w-full h-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" className="stroke-white/5" strokeWidth="8" fill="none" />

                            {stats.present > 0 && (
                                <motion.circle
                                    initial={{ strokeDasharray: `0 ${circumference}` }}
                                    animate={{ strokeDasharray: `${(pPresent / 100) * circumference} ${circumference}` }}
                                    transition={{ duration: 2, delay: 0.5, ease: "circOut" }}
                                    cx="50" cy="50" r="40"
                                    stroke="#10b981" strokeWidth="10" fill="none"
                                    strokeLinecap="round"
                                />
                            )}
                            {stats.late > 0 && (
                                <motion.circle
                                    initial={{ strokeDasharray: `0 ${circumference}` }}
                                    animate={{ strokeDasharray: `${(pLate / 100) * circumference} ${circumference}` }}
                                    transition={{ duration: 2, delay: 0.7, ease: "circOut" }}
                                    cx="50" cy="50" r="40"
                                    stroke="#f59e0b" strokeWidth="10" fill="none"
                                    transform={`rotate(${rotLate} 50 50)`}
                                    strokeLinecap="round"
                                />
                            )}
                            {stats.absent > 0 && (
                                <motion.circle
                                    initial={{ strokeDasharray: `0 ${circumference}` }}
                                    animate={{ strokeDasharray: `${(pAbsent / 100) * circumference} ${circumference}` }}
                                    transition={{ duration: 2, delay: 0.9, ease: "circOut" }}
                                    cx="50" cy="50" r="40"
                                    stroke="#f43f5e" strokeWidth="10" fill="none"
                                    transform={`rotate(${rotAbsent} 50 50)`}
                                    strokeLinecap="round"
                                />
                            )}
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center flex-col z-20">
                            <motion.span
                                key={Math.round(pPresent)}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-7xl font-[1000] text-text-primary tracking-tighter leading-none italic"
                            >
                                {Math.round(pPresent || 0)}
                            </motion.span>
                            <span className="text-[11px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">% EFETIVO</span>
                        </div>
                    </motion.div>

                    {/* Elite Stats Grid */}
                    <div className="flex-1 w-full grid grid-cols-2 gap-6">
                        <StatusCard label="Presentes" value={stats.present} color="text-emerald-500" bg="bg-emerald-500/5 border-emerald-500/10" dot="bg-emerald-500" delay={0.1} />
                        <StatusCard label="Incidências" value={stats.late} color="text-amber-500" bg="bg-amber-500/5 border-amber-500/10" dot="bg-amber-500" delay={0.2} />
                        <StatusCard label="Ausências" value={stats.absent} color="text-rose-500" bg="bg-rose-500/5 border-rose-500/10" dot="bg-rose-500" delay={0.3} />
                        <StatusCard label="Descansos" value={stats.dayOff} color="text-text-muted" bg="bg-surface-secondary/50 border-white/5" dot="bg-text-muted" delay={0.4} />
                    </div>
                </div>

                <motion.div
                    variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
                    className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-text-muted"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-12 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ x: "-100%" }}
                                animate={{ x: "0%" }}
                                transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop", ease: "linear" }}
                                className="h-full bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent w-full"
                            />
                        </div>
                        <span>Processamento de Redes: {stats.total} Terminais Ativos</span>
                    </div>
                    <span className="text-text-muted italic opacity-40">Sync Status: Estável</span>
                </motion.div>
            </div>
        </motion.div>
    );
}

function StatusCard({ label, value, color, bg, dot, delay }: { label: string, value: number, color: string, bg: string, dot: string, delay: number }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5, scale: 1.02 }}
            className={cn(
                "p-6 rounded-[2rem] transition-all duration-500 border hover:border-brand-orange/30 group/card relative overflow-hidden",
                bg
            )}
        >
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px_currentColor]", dot, color.replace('text-', 'shadow-'))} />
                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest group-hover/card:text-text-primary transition-colors">{label}</p>
                </div>
                <p className={cn("text-4xl font-[1000] tracking-tighter italic", color)}>{value}</p>
            </div>
            <div className="absolute bottom-0 right-0 w-16 h-16 bg-white/[0.02] rounded-full -mr-8 -mb-8 transition-transform group-hover/card:scale-150 duration-700" />
        </motion.div>
    );
}
