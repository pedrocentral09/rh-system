'use client';

import { motion } from 'framer-motion';

import { DashboardFilters } from '@/modules/core/components/DashboardFilters';

interface DashboardHeaderProps {
    companies: any[];
    stores: any[];
    filters: any;
}

export function DashboardHeader({ companies, stores, filters }: DashboardHeaderProps) {
    return (
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 border-b border-border">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-0.5 w-8 bg-brand-orange" />
                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em]">Ambiente de Gestão</span>
                </div>
                <h1 className="text-5xl font-black text-text-primary tracking-tighter uppercase leading-none">
                    Performance <span className="text-brand-orange">Corporativa</span>
                </h1>
                <p className="text-text-muted font-bold tracking-tight text-sm mt-2 font-mono">
                    [ SYSTEM_VERSION: 1.2.0-PREMIUM ] — ANALYTICS & OPS
                </p>
            </motion.div>
            <div className="bg-surface-secondary p-2 rounded-2xl border border-border backdrop-blur-md">
                <DashboardFilters companies={companies} stores={stores} />
            </div>
        </div>
    );
}
