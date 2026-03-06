'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Clock,
    FileText,
    Palmtree as Vacation,
    TreeDeciduous as Career,
    Coins,
    LogOut,
    Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAction } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';

const navItems = [
    { label: 'Início', href: '/portal', icon: Home },
    { label: 'Ponto', href: '/portal/time-tracking', icon: Clock },
    { label: 'Holerite', href: '/portal/payslips', icon: FileText },
    { label: 'Férias', href: '/portal/vacations', icon: Vacation },
    { label: 'Documentos', href: '/portal/documents', icon: Paperclip },
    { label: 'Carreira', href: '/portal/career', icon: Career },
    { label: 'Coins', href: '/portal/rewards', icon: Coins },
];

export function PortalSidebar({ employeeName }: { employeeName: string }) {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-72 bg-[#0A0F1C] border-r border-white/5 h-full sticky top-0 z-20">
            {/* Logo Area */}
            <div className="p-8 flex flex-col items-center">
                <div className="bg-white/5 p-4 rounded-[28px] mb-6 w-full border border-white/5 flex items-center justify-center backdrop-blur-3xl group transition-all hover:bg-white/10">
                    <img src="/logo.jpg" alt="Logo" className="max-h-16 w-auto object-contain brightness-125 contrast-125 group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-orange">Portal Digital</p>
                    <h2 className="text-white text-lg font-[1000] tracking-tighter">família. <span className="text-slate-500 italic">corp</span></h2>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
                <p className="text-[9px] font-[1000] text-slate-500 uppercase tracking-[0.3em] px-4 mb-4">Geral</p>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center space-x-3 px-5 py-3.5 rounded-[20px] transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "bg-white/10 text-white shadow-2xl border border-white/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-brand-orange shadow-[2px_0_10px_rgba(249,115,22,0.5)]"
                                />
                            )}
                            <Icon className={cn("h-5 w-5 transition-all duration-300", isActive ? "text-brand-orange scale-110" : "group-hover:scale-110")} />
                            <span className="text-sm font-[1000] uppercase tracking-widest leading-none">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="p-6 mt-auto">
                <div className="bg-white/[0.05] border border-white/10 rounded-[32px] p-4 group hover:bg-white/[0.08] transition-all duration-500 cursor-pointer">
                    <div className="flex items-center space-x-4 mb-4 px-1">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-700 flex items-center justify-center text-white font-[1000] shadow-lg shadow-brand-orange/20">
                            {employeeName.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-[1000] text-white uppercase tracking-tight truncate">{employeeName}</p>
                            <div className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ativo</p>
                            </div>
                        </div>
                    </div>

                    <form action={logoutAction}>
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-slate-300 hover:text-white hover:bg-rose-500/20 gap-3 rounded-2xl h-12 transition-all font-[1000] text-[10px] uppercase tracking-widest border border-transparent hover:border-rose-500/30"
                        >
                            <LogOut className="h-4 w-4" />
                            Sair do Portal
                        </Button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
