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
        { label: 'Colaboradores', value: stats.totalEmployees, color: 'text-brand-orange', bg: 'bg-brand-orange/20', glow: 'shadow-brand-orange/10', sub: 'Cadastros Totais', icon: '👤' },
        { label: 'Ativos Agora', value: stats.activeEmployees, color: 'text-emerald-400', bg: 'bg-emerald-400/20', glow: 'shadow-emerald-400/10', sub: 'Equipe em Operação', icon: '⚡' },
        { label: 'Unidades', value: stats.storeCount, color: 'text-sky-400', bg: 'bg-sky-400/20', glow: 'shadow-sky-400/10', sub: 'Lojas & Filiais', icon: '🏢' },
        { label: 'Divisões', value: stats.sectorCount, color: 'text-amber-400', bg: 'bg-amber-400/20', glow: 'shadow-amber-400/10', sub: 'Setores Mapeados', icon: '🎯' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className={`relative group h-48 overflow-hidden bg-[#0A0F1C] rounded-[2rem] p-8 border border-white/5 shadow-2xl transition-all duration-700 hover:border-white/20 hover:scale-[1.02] hover:-translate-y-2`}>
                        {/* High-end Lighting and Accents */}
                        <div className={`absolute top-0 right-0 w-32 h-32 ${item.bg} blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000`} />
                        <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-white/5 blur-3xl opacity-50" />

                        {/* Floating Icon Decoration */}
                        <div className="absolute top-8 right-8 text-4xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 grayscale select-none pointer-events-none">
                            {item.icon}
                        </div>

                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className={`h-1 w-1 rounded-full ${item.color.replace('text-', 'bg-')} animate-pulse`} />
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] group-hover:text-slate-300 transition-colors">
                                        {item.label}
                                    </p>
                                </div>
                                <div className={`text-5xl font-black ${item.color} tracking-tighter transition-all duration-500 group-hover:tracking-tight`}>
                                    {item.value}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className={`h-[2px] w-8 ${item.bg} rounded-full overflow-hidden`}>
                                    <div className={`h-full ${item.color.replace('text-', 'bg-')} w-2/3 animate-shimmer`} />
                                </div>
                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
                                    {item.sub}
                                </span>
                            </div>
                        </div>

                        {/* Decorative Bottom Line */}
                        <div className={`absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:via-white/20 transition-all duration-1000`} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
