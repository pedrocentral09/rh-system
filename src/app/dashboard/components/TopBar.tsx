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
        <div className="fixed top-0 left-4 right-0 z-40 flex flex-col items-center pointer-events-none">
            {/* Trigger Area - Extreme top edge only (2px) to prevent accidental modal overlap */}
            {!isHovered && (
                <div
                    className="h-[2px] w-full bg-gradient-to-b from-brand-orange/20 to-transparent cursor-pointer pointer-events-auto"
                    onMouseEnter={() => setIsHovered(true)}
                />
            )}

            <motion.header
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={false}
                animate={{
                    y: isHovered ? 0 : -120, // Slide up out of view
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.98
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="w-full px-8 py-5 flex justify-between items-center bg-surface/90 backdrop-blur-2xl border-b border-border shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative dark:shadow-black/50 pointer-events-auto"
            >
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-text-muted uppercase tracking-widest mb-1">
                        <span className="text-brand-orange">Painel Administrativo</span>
                        <span className="opacity-30">/</span>
                        <span>Gestão Geral</span>
                    </div>
                    <h2 className="text-lg font-black text-text-primary uppercase tracking-tighter">
                        Excelência <span className="text-brand-orange">Operacional</span>
                    </h2>
                </div>
                <HeaderActions stats={stats || {}} />
            </motion.header>
        </div>
    );
}
