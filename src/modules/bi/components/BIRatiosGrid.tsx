'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Users, Wallet, Activity, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface BIRatiosGridProps {
    data: {
        turnoverRate: number;
        retentionRate: number;
        absenteeismRate: number;
        financials: {
            monthlyBaseSalary: number;
            estimatedCharges: number;
            totalProvision: number;
        };
        headcount: {
            active: number;
            hiredYear: number;
            terminatedYear: number;
        };
    };
}

export function BIRatiosGrid({ data }: BIRatiosGridProps) {
    const stats = [
        {
            label: 'Taxa de Turnover',
            value: `${data.turnoverRate}%`,
            description: 'Rotatividade nos últimos 12 meses',
            icon: TrendingUp,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            trend: data.turnoverRate > 20 ? 'high' : 'low',
            good: data.turnoverRate < 15
        },
        {
            label: 'Retenção de Talentos',
            value: `${data.retentionRate}%`,
            description: 'Equipe com mais de 1 ano de casa',
            icon: Target,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            trend: 'up',
            good: data.retentionRate > 70
        },
        {
            label: 'Absenteísmo Local',
            value: `${data.absenteeismRate}%`,
            description: 'Ratio de ausências por atestados',
            icon: Activity,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            trend: 'down',
            good: data.absenteeismRate < 3
        },
        {
            label: 'Projeção de Folha',
            value: data.financials.totalProvision.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            description: 'Custo mensal total (Base + Encargos)',
            icon: Wallet,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10',
            trend: 'neutral',
            good: true
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative bg-surface border border-border p-8 rounded-[2.5rem] shadow-xl overflow-hidden hover:border-brand-orange/30 transition-all duration-500"
                >
                    <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} blur-3xl opacity-20 group-hover:opacity-40 transition-opacity`} />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center border border-white/5`}>
                                <stat.icon className={`h-7 w-7 ${stat.color}`} />
                            </div>
                            {stat.trend !== 'neutral' && (
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${stat.good ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                    {stat.good ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                                    {stat.good ? 'Healthy' : 'Critical'}
                                </div>
                            )}
                        </div>

                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                        <h4 className={`text-3xl font-black ${stat.color} tracking-tighter mb-2`}>{stat.value}</h4>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60 leading-tight">
                            {stat.description}
                        </p>

                        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(j => (
                                    <div key={j} className="h-6 w-6 rounded-full border-2 border-surface bg-surface-secondary flex items-center justify-center text-[8px] font-black text-text-muted">
                                        {j}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest italic">Live Intel</span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
