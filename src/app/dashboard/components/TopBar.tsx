'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { HeaderActions } from '../HeaderActions';

interface TopBarProps {
    stats: any;
}

export function TopBar({ stats }: TopBarProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="hidden lg:flex fixed top-0 left-4 right-0 z-40 flex-col items-center pointer-events-none">
            {/* Trigger Area - Extreme top edge only (2px) to prevent accidental modal overlap */}
            {!isHovered && (
                <div
                    className="h-2 w-full bg-gradient-to-b from-brand-orange/5 to-transparent cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setIsHovered(true)}
                />
            )}

            <motion.header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    y: isHovered ? 0 : -140, // Slide up out of view
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.98
                }}
                transition={{ type: 'spring', damping: 30, stiffness: 100 }}
                className="w-full px-12 py-6 flex justify-between items-center bg-surface/90 backdrop-blur-3xl border-b border-border shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative dark:shadow-black/50 pointer-events-auto rounded-b-[40px] border-x"
            >
                <div className="flex items-center gap-6">
                    <div className="h-12 w-1.5 bg-brand-orange rounded-full shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 opacity-60">
                            <span className="text-brand-orange">Operação</span>
                            <span className="opacity-30">/</span>
                            <span>Gestão de Excelência</span>
                        </div>
                        <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">
                            FAMÍLIA <span className="text-brand-orange">RH</span>
                        </h2>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <HeaderActions stats={stats || {}} />
                </div>
            </motion.header>
        </div>
    );
}
