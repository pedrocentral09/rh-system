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
        <div
            className="fixed top-0 left-4 right-0 z-40 flex flex-col items-center"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Trigger Area - always visible but very thin when not hovered */}
            {!isHovered && (
                <div className="h-4 w-full bg-gradient-to-b from-brand-orange/5 to-transparent flex items-start justify-center cursor-pointer group">
                    <div className="w-24 h-1 rounded-full bg-brand-orange/20 group-hover:bg-brand-orange group-hover:w-40 transition-all duration-700 shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                </div>
            )}

            <motion.header
                initial={false}
                animate={{
                    y: isHovered ? 0 : -120, // Slide up out of view
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.98
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="w-full px-8 py-5 flex justify-between items-center bg-[#0A0F1C]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)] relative"
            >
                <div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                        <span className="text-brand-orange">Painel Administrativo</span>
                        <span className="opacity-30">/</span>
                        <span>Gestão Geral</span>
                    </div>
                    <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                        Excelência <span className="text-brand-orange">Operacional</span>
                    </h2>
                </div>
                <HeaderActions stats={stats || {}} />
            </motion.header>
        </div>
    );
}
