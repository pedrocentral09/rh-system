'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface StatsGridProps {
    stats: {
        totalEmployees: number;
        activeEmployees: number;
        storeCount: number;
        sectorCount: number;
    };
}

export function DashboardStatsGrid({ stats }: StatsGridProps) {
    const items = [
        { label: 'Colaboradores', value: stats.totalEmployees, color: 'text-brand-orange', bg: 'bg-brand-orange/[0.03]', glow: 'shadow-brand-orange/20', sub: 'Rede Unificada', icon: '🫂' },
        { label: 'Ativos Agora', value: stats.activeEmployees, color: 'text-emerald-400', bg: 'bg-emerald-400/[0.03]', glow: 'shadow-emerald-400/20', sub: 'Status Operacional', icon: '⚡' },
        { label: 'Unidades', value: stats.storeCount, color: 'text-sky-400', bg: 'bg-sky-400/[0.03]', glow: 'shadow-sky-400/20', sub: 'Matriz e Filiais', icon: '🏢' },
        { label: 'Divisões', value: stats.sectorCount, color: 'text-amber-400', bg: 'bg-amber-400/[0.03]', glow: 'shadow-amber-400/20', sub: 'Centros de Custo', icon: '🎯' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -10, scale: 1.02 }}
                >
                    <div className={`relative group h-52 overflow-hidden bg-surface border border-white/5 rounded-[3rem] p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] transition-all duration-700 hover:border-brand-orange/30`}>
                        {/* High-end Lighting and Accents */}
                        <div className={`absolute top-0 right-0 w-48 h-48 ${item.bg.replace('0.03', '0.08')} blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 rounded-full`} />
                        <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-white/[0.02] blur-[80px] rounded-full" />

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className={`h-1.5 w-1.5 rounded-full ${item.color.replace('text-', 'bg-')} shadow-[0_0_12px_currentColor] animate-pulse`} />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] group-hover:text-text-primary transition-colors">
                                        {item.label}
                                    </p>
                                </div>
                                <div className={`text-6xl font-[1000] ${item.color} tracking-tighter italic leading-none group-hover:scale-110 transition-transform duration-700 origin-left`}>
                                    {item.value}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-[1px] flex-1 bg-white/5 relative overflow-hidden">
                                    <motion.div
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "100%" }}
                                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        className={`absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-brand-orange to-transparent`}
                                    />
                                </div>
                                <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
                                    {item.sub}
                                </span>
                            </div>
                        </div>

                        {/* Decoration Icon */}
                        <span className="absolute -right-4 -bottom-4 text-8xl opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000 rotate-12 group-hover:rotate-0 pointer-events-none select-none">
                            {item.icon}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
