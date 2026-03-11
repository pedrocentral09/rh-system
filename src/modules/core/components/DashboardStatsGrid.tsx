'use client';

import { motion } from 'framer-motion';
import { Users2, Clock, UserCheck, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatsProps {
    stats: {
        totalEmployees: number;
        activeEmployees: number;
        storeCount: number;
        sectorCount: number;
        totalHours?: string;
        presentToday?: number;
        avgPerformance?: number;
    };
}

export function DashboardStatsGrid({ stats }: StatsProps) {
    const items = [
        { 
            label: 'Colaboradores', 
            value: stats.totalEmployees, 
            trend: '+12%', 
            isPositive: true, 
            icon: <Users2 className="w-5 h-5" />, 
            color: 'emerald' 
        },
        { 
            label: 'Banco de Horas', 
            value: stats.totalHours || '1.240h', 
            trend: '-5%', 
            isPositive: false, 
            icon: <Clock className="w-5 h-5" />, 
            color: 'orange' 
        },
        { 
            label: 'Presentes Hoje', 
            value: stats.presentToday || 142, 
            trend: '88%', 
            isPositive: true, 
            icon: <UserCheck className="w-5 h-5" />, 
            color: 'blue' 
        },
        { 
            label: 'Produtividade', 
            value: (stats.avgPerformance || 94) + '%', 
            trend: '+2%', 
            isPositive: true, 
            icon: <TrendingUp className="w-5 h-5" />, 
            color: 'indigo' 
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.8, 
                        delay: i * 0.1, 
                        ease: [0.16, 1, 0.3, 1] 
                    }}
                    className="relative group h-full"
                >
                    <div className="h-full bg-surface/40 backdrop-blur-md border border-border/60 rounded-[2rem] p-5 sm:p-7 transition-all duration-500 hover:border-brand-orange/30 hover:-translate-y-1 hover:shadow-2xl">
                        <div className="flex items-start justify-between mb-6">
                            <div className="w-12 h-12 bg-surface-secondary border border-border rounded-2xl flex items-center justify-center text-text-muted group-hover:bg-brand-orange group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-sm">
                                {item.icon}
                            </div>
                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${item.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {item.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {item.trend}
                            </div>
                        </div>

                        <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-2 group-hover:text-brand-orange transition-colors">
                            {item.label}
                        </h2>

                        <div className="flex items-baseline gap-2">
                            <span className="text-[clamp(1.5rem,4vw,2.5rem)] font-black text-text-primary uppercase tracking-tighter leading-none">
                                {item.value}
                            </span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-border/50">
                            <div className="w-full h-1 bg-surface-secondary rounded-full overflow-hidden">
                                <motion.div 
                                    className="h-full bg-brand-orange" 
                                    initial={{ width: 0 }}
                                    animate={{ width: i === 0 ? '75%' : i === 1 ? '45%' : i === 2 ? '88%' : '94%' }}
                                    transition={{ duration: 1.5, delay: 0.5 + (i * 0.1) }}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
