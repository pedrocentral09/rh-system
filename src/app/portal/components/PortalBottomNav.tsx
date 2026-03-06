'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Clock,
    FileText,
    Palmtree as Vacation,
    TreeDeciduous as Career,
    Coins,
    Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
    { label: 'Início', href: '/portal', icon: Home },
    { label: 'Ponto', href: '/portal/time-tracking', icon: Clock },
    { label: 'Recibos', href: '/portal/payslips', icon: FileText },
    { label: 'Férias', href: '/portal/vacations', icon: Vacation },
    { label: 'Docs', href: '/portal/documents', icon: Paperclip },
];

export function PortalBottomNav() {
    const pathname = usePathname();

    return (
        <div className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-[400px]">
            <nav className="w-full bg-slate-950 border border-white/20 rounded-full px-4 py-3 flex justify-around items-center shadow-[0_25px_60px_rgba(0,0,0,1)] relative overflow-hidden">
                {/* Subtle top rim light - solid, no alpha */}
                <div className="absolute top-0 left-0 right-0 h-px bg-slate-800" />

                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center transition-all duration-500 relative py-1 min-w-[56px]",
                                isActive ? "scale-110" : "opacity-50 hover:opacity-80"
                            )}
                        >
                            <div className={cn(
                                "p-2.5 rounded-2xl transition-all duration-500 mb-1",
                                isActive ? "bg-[#1E293B] text-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "text-slate-300"
                            )}>
                                <Icon className={cn("h-6 w-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                            </div>
                            <span className={cn(
                                "text-[9px] font-[1000] uppercase tracking-widest",
                                isActive ? "text-white" : "text-slate-500"
                            )}>
                                {item.label}
                            </span>

                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill-mobile"
                                    className="absolute -bottom-1 w-6 h-1 rounded-full bg-brand-orange shadow-[0_0_15px_rgba(249,115,22,1)]"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
