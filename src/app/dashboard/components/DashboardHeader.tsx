'use client';

import { motion } from 'framer-motion';

import { DashboardFilters } from '@/modules/core/components/DashboardFilters';

interface DashboardHeaderProps {
    companies: any[];
    stores: any[];
    filters: any;
}

export function DashboardHeader({ companies, stores, filters }: DashboardHeaderProps) {
    const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 pb-10 relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10"
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Sistema Ativo</span>
                    </div>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest opacity-40">/</span>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{today}</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-[0.02em] uppercase leading-[0.9] mb-4">
                    FAMÍLIA <br />
                    <span className="text-brand-orange">RH</span>
                </h1>
                
                <div className="flex items-center gap-4 text-xs font-bold font-mono">
                    <span className="px-2 py-0.5 bg-text-primary text-background rounded">V 2.5</span>
                    <span className="text-text-muted opacity-60">PRECISÃO CIRÚRGICA NA GESTÃO DE PESSOAS</span>
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="bg-surface/50 backdrop-blur-xl p-4 rounded-[2.5rem] border border-border shadow-2xl shadow-black/10 dark:shadow-brand-orange/5"
            >
                <DashboardFilters companies={companies} stores={stores} />
            </motion.div>

            {/* Background Decorative Element */}
            <div className="absolute -top-24 -left-20 w-96 h-96 bg-brand-orange/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
        </div>
    );
}
