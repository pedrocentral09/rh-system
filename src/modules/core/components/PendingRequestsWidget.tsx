'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, Palmtree, PenTool, ChevronRight, AlertCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface PendingRequestsWidgetProps {
    pendingVacations: number;
    pendingSignatures: number;
}

export function PendingRequestsWidget({ pendingVacations, pendingSignatures }: PendingRequestsWidgetProps) {
    const total = pendingVacations + pendingSignatures;

    const items = [
        {
            label: 'Férias Pendentes',
            count: pendingVacations,
            icon: Palmtree,
            href: '/dashboard/vacations',
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Assinaturas em Aberto',
            count: pendingSignatures,
            icon: PenTool,
            href: '/dashboard/documents',
            color: 'text-brand-orange',
            bg: 'bg-brand-orange/10'
        }
    ];

    return (
        <div className="bg-surface border border-white/5 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden h-full group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/[0.03] blur-[100px] pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-40 h-40 bg-emerald-500/[0.02] blur-[80px] rounded-full" />

            <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-[1000] text-text-primary uppercase tracking-tighter italic">Fluxo de <span className="text-slate-400">Aprovação</span></h3>
                        <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] mt-1.5 animate-pulse">Aguardando Análise</p>
                    </div>
                    <div className="h-14 w-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform duration-700">
                        <ClipboardCheck className="h-7 w-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                </div>

                <div className="space-y-4 flex-1">
                    {items.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.8 }}
                        >
                            <Link href={item.href} className="block group/item">
                                <div className="flex items-center justify-between p-5 rounded-[1.8rem] bg-surface-secondary/40 backdrop-blur-sm border border-white/5 hover:border-brand-orange/30 hover:bg-surface transition-all duration-500 hover:shadow-2xl hover:shadow-brand-orange/5">
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center border border-white/5 group-hover/item:scale-110 transition-all duration-700 shadow-lg",
                                            item.bg,
                                            item.count > 0 ? "border-brand-orange/20" : ""
                                        )}>
                                            <item.icon className={cn("h-6 w-6", item.color)} />
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-[1000] text-text-primary uppercase tracking-widest leading-none mb-1.5">{item.label}</p>
                                            <div className="flex items-center gap-2">
                                                <div className={cn("h-1 w-1 rounded-full", item.count > 0 ? "bg-brand-orange animate-ping" : "bg-text-muted opacity-20")} />
                                                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest opacity-50 group-hover/item:opacity-100 transition-opacity">Visualizar Fila</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={cn(
                                            "text-3xl font-[1000] italic tracking-tighter group-hover:scale-110 transition-transform",
                                            item.count > 0 ? item.color.replace('500', '400') : "text-text-muted opacity-20"
                                        )}>{item.count}</span>
                                        <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center group-hover/item:bg-brand-orange group-hover/item:border-brand-orange transition-all duration-500">
                                            <ArrowUpRight className="h-4 w-4 text-text-muted group-hover/item:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {total === 0 && (
                    <div className="mt-8 p-5 rounded-[1.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-4 group/status transition-colors">
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/status:scale-110 transition-transform">
                            <AlertCircle className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-[1000] text-emerald-500 uppercase tracking-[0.2em]">Compliance 100% — Nenhuma Pendência</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// REMOVED LOCAL CN
