'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/modules/core/actions/auth';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
    // We can add props here if needed
}

export function AppSidebar() {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <aside
            className="fixed left-0 top-0 h-full z-50 flex"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ width: isHovered ? '280px' : '60px' }} // Increased width to see icons when collapsed?
        // Actually user wanted "OCULTAR" (hide). I'll keep it very small.
        >
            {/* Trigger Strip (Visible interactive area) */}
            {!isHovered && (
                <div className="h-full w-4 bg-gradient-to-r from-brand-orange/5 to-transparent flex items-center justify-center cursor-pointer group">
                    <div className="h-24 w-1 rounded-full bg-brand-orange/20 group-hover:bg-brand-orange group-hover:h-40 transition-all duration-700 shadow-[0_0_15px_rgba(255,102,0,0.5)]" />
                </div>
            )}

            {/* Actual Sidebar Content */}
            <motion.div
                initial={false}
                animate={{
                    x: isHovered ? 0 : -300,
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1 : 0.95
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                className="w-[280px] h-full bg-surface/90 backdrop-blur-2xl border-r border-border flex flex-col shadow-[20px_0_50px_-20px_rgba(0,0,0,0.5)] dark:shadow-black/50"
            >
                <div className="p-8 flex flex-col items-center">
                    <div className="relative w-full aspect-[2/1] mb-6 bg-white rounded-2xl p-4 shadow-2xl shadow-black/50 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Image
                            src="/logo.jpg"
                            alt="Logo Familia Supermercados"
                            fill
                            className="object-contain p-2"
                            priority
                            sizes="(max-width: 280px) 100vw, 280px"
                            quality={100}
                        />
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-black tracking-[0.2em] text-text-primary uppercase bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">Sistema RH</span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="h-1 w-1 rounded-full bg-brand-orange animate-pulse" />
                            <span className="text-[9px] text-text-muted uppercase font-black tracking-widest leading-none">Console de Gestão</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Visão Geral</p>
                    </div>

                    <SidebarLink href="/dashboard" icon="🏠" label="Início" />
                    <SidebarLink href="/dashboard/reports" icon="📊" label="Relatórios" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Pessoas & Operação</p>
                    </div>

                    <SidebarLink href="/dashboard/personnel" icon="👥" label="Colaboradores" />
                    <SidebarLink href="/dashboard/documents" icon="📁" label="Documentação" />
                    <SidebarLink href="/dashboard/scales" icon="🗓️" label="Escalas de Trabalho" />
                    <SidebarLink href="/dashboard/recruitment" icon="📢" label="Recrutamento" />
                    <SidebarLink href="/dashboard/time-tracking" icon="⏰" label="Controle de Ponto" />
                    <SidebarLink href="/dashboard/vacations" icon="🏖️" label="Férias & Licenças" />
                    <SidebarLink href="/dashboard/disciplinary" icon="⚖️" label="Disciplinar" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Financeiro & Carreira</p>
                    </div>

                    <SidebarLink href="/dashboard/payroll" icon="💰" label="Folha de Pagamento" />
                    <SidebarLink href="/dashboard/career" icon="🌳" label="Plano de Carreira" />
                    <SidebarLink href="/dashboard/performance/cycles" icon="📊" label="Ciclos de Desempenho" />
                    <SidebarLink href="/dashboard/rewards/catalog" icon="🪙" label="Família Coins" color="text-amber-500" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Comunicação</p>
                    </div>

                    <SidebarLink href="/dashboard/communications" icon="💬" label="Atendimento" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Utilidades</p>
                    </div>

                    <SidebarLink href="/dashboard/tools/admission-form" icon="📋" label="Ficha Admissão" />
                    <SidebarLink href="/dashboard/security/audit" icon="🛡️" label="Audit. Segurança" />
                </nav>

                <div className="p-6 border-t border-border space-y-3">
                    <Link
                        href="/dashboard/configuration"
                        className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-300 group"
                    >
                        <span className="text-lg group-hover:rotate-90 transition-transform duration-500">⚙️</span>
                        <span className="font-bold text-[11px] uppercase tracking-wider">Configurações</span>
                    </Link>
                    <form action={logoutAction}>
                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border border-rose-500/20 group">
                            <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
                            Sair do Sistema
                        </button>
                    </form>
                </div>
            </motion.div>
        </aside>
    );
}

function SidebarLink({ href, icon, label, color = "text-text-secondary" }: { href: string, icon: string, label: string, color?: string }) {
    const pathname = usePathname();
    const isActive = pathname === href || (href !== '/dashboard' && pathname?.startsWith(href));

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-500 group relative overflow-hidden active:scale-95",
                isActive ? "bg-brand-orange/10 text-text-primary shadow-[inset_0_0_20px_rgba(255,120,0,0.05)]" : "hover:bg-surface-secondary/80"
            )}
        >
            <motion.div
                initial={false}
                animate={{
                    opacity: isActive ? 1 : 0,
                    height: isActive ? '60%' : '0%'
                }}
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 bg-brand-orange rounded-r-full shadow-[0_0_15px_rgba(255,102,0,0.8)] z-10"
            />

            <span className={cn(
                "text-lg transition-all duration-500 group-hover:scale-125 group-hover:rotate-6",
                isActive && "scale-110 rotate-3 animate-pulse"
            )}>{icon}</span>

            <span className={cn(
                "font-black text-[10px] uppercase tracking-widest transition-colors flex-1",
                isActive ? "text-brand-orange" : color,
                "group-hover:text-text-primary"
            )}>
                {label}
            </span>

            <ChevronRight className={cn(
                "h-3 w-3 transition-all duration-500",
                isActive ? "text-brand-orange translate-x-0 opacity-100" : "text-text-muted opacity-0 group-hover:opacity-100 group-hover:translate-x-1"
            )} />

            {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/5 via-transparent to-transparent pointer-events-none" />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        </Link>
    );
}
