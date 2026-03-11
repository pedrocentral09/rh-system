'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/modules/core/actions/auth';
import { 
    ChevronRight, 
    Home, 
    BarChart3, 
    Users, 
    Folder, 
    Calendar, 
    Megaphone, 
    Clock, 
    Palmtree, 
    Scale, 
    Banknote, 
    Trees, 
    MessageSquare, 
    ClipboardList, 
    ShieldCheck, 
    Settings, 
    LogOut,
    Menu,
    X,
    Coins
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppSidebar() {
    const [isHovered, setIsHovered] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile sidebar on route change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const sidebarContent = (
        <div className="flex flex-col h-full">
            <div className="p-8 flex flex-col items-center">
                <div className="relative w-full aspect-[2/1] mb-6 bg-white rounded-3xl p-4 shadow-xl shadow-black/10 overflow-hidden group border border-border/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <Image
                        src="/logo.jpg"
                        alt="Logo Familia Supermercados"
                        fill
                        className="object-contain p-2"
                        priority
                        sizes="(max-width: 280px) 100vw, 280px"
                        quality={75}
                    />
                </div>
                <div className="text-center">
                    <span className="text-sm font-black tracking-[0.2em] text-text-primary uppercase bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text text-transparent">FAMÍLIA RH</span>
                    <div className="flex items-center justify-center gap-2 mt-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse shadow-[0_0_8px_rgba(255,102,0,0.6)]" />
                        <span className="text-[9px] text-text-muted uppercase font-black tracking-widest leading-none opacity-70">Console de Gestão</span>
                    </div>
                </div>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
                <div className="px-4 py-2 mt-2">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Visão Geral</p>
                </div>

                <SidebarLink href="/dashboard" icon={<Home size={18} />} label="Início" />
                <SidebarLink href="/dashboard/reports" icon={<BarChart3 size={18} />} label="Relatórios" />

                <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Pessoas & Operação</p>
                </div>

                <SidebarLink href="/dashboard/personnel" icon={<Users size={18} />} label="Colaboradores" />
                <SidebarLink href="/dashboard/documents" icon={<Folder size={18} />} label="Documentação" />
                <SidebarLink href="/dashboard/scales" icon={<Calendar size={18} />} label="Escalas" />
                <SidebarLink href="/dashboard/recruitment" icon={<Megaphone size={18} />} label="Recrutamento" />
                <SidebarLink href="/dashboard/time-tracking" icon={<Clock size={18} />} label="Controle de Ponto" />
                <SidebarLink href="/dashboard/vacations" icon={<Palmtree size={18} />} label="Férias & Licenças" />
                <SidebarLink href="/dashboard/disciplinary" icon={<Scale size={18} />} label="Disciplinar" />

                <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Financeiro & Carreira</p>
                </div>

                <SidebarLink href="/dashboard/payroll" icon={<Banknote size={18} />} label="Folha de Pagamento" />
                <SidebarLink href="/dashboard/career" icon={<Trees size={18} />} label="Plano de Carreira" />
                <SidebarLink href="/dashboard/performance/cycles" icon={<BarChart3 size={18} />} label="Ciclos de Desempenho" />
                <SidebarLink href="/dashboard/rewards/catalog" icon={<Coins size={18} />} label="Família Coins" />

                <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Comunicação</p>
                </div>
                
                <SidebarLink href="/dashboard/whatsapp-bot" icon={<MessageSquare size={18} />} label="WhatsApp Bot" />
                <SidebarLink href="/dashboard/communications" icon={<MessageSquare size={18} />} label="Atendimento" />

                <div className="pt-6 pb-2 px-4">
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] opacity-50">Utilidades</p>
                </div>

                <SidebarLink href="/dashboard/tools/admission-form" icon={<ClipboardList size={18} />} label="Ficha Admissão" />
                <SidebarLink href="/dashboard/security/audit" icon={<ShieldCheck size={18} />} label="Audit. Segurança" />
            </nav>

            <div className="p-6 border-t border-border space-y-3 bg-surface-secondary/20">
                <Link
                    href="/dashboard/configuration"
                    className="flex items-center space-x-3 px-4 py-3 rounded-2xl text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all duration-300 group"
                >
                    <Settings 
                        size={18} 
                        className="group-hover:rotate-90 transition-transform duration-500" 
                    />
                    <span className="font-bold text-[11px] uppercase tracking-wider">Configurações</span>
                </Link>
                <form action={logoutAction}>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 bg-rose-500/5 hover:bg-rose-500 text-rose-500 hover:text-white py-4 rounded-2xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border border-rose-500/10 group active:scale-95">
                        <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Sair do Sistema
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Hover Trigger */}
            <div className="hidden lg:block fixed left-0 top-0 h-full z-[60] w-2 transition-colors hover:bg-brand-orange/20" onMouseEnter={() => setIsHovered(true)} />

            {/* Mobile Header Toggle */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 px-6 bg-surface/80 backdrop-blur-xl border-b border-border z-[60] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white p-1">
                        <Image src="/logo.jpg" alt="Logo" width={32} height={32} className="object-contain" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-text-primary">FAMÍLIA RH</span>
                </div>
                <button 
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="p-2 rounded-xl bg-surface-secondary border border-border text-text-primary active:scale-90 transition-all"
                >
                    {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Desktop Hover Sidebar */}
            <aside
                className="hidden lg:block fixed left-0 top-0 h-full z-50 flex"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <motion.div
                    initial={false}
                    animate={{
                        x: isHovered ? 0 : -320,
                        opacity: isHovered ? 1 : 0,
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 150 }}
                    className="w-[300px] h-full bg-surface/95 backdrop-blur-3xl border-r border-border flex flex-col shadow-[40px_0_80px_-40px_rgba(0,0,0,0.5)] dark:shadow-black/70"
                >
                    {sidebarContent}
                </motion.div>
            </aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
                            className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[280px] bg-surface z-[80] lg:hidden border-r border-border shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}

function SidebarLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "group relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-500",
                isActive 
                    ? "text-brand-orange" 
                    : "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-brand-orange/5 border border-brand-orange/10 rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            
            <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-500",
                isActive 
                    ? "bg-brand-orange text-white shadow-[0_10px_20px_-5px_rgba(255,120,0,0.5)] scale-110" 
                    : "bg-surface-secondary text-text-muted group-hover:bg-brand-orange group-hover:text-white group-hover:rotate-6 group-hover:scale-110"
            )}>
                {icon}
            </div>

            <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex-1",
                isActive ? "translate-x-1" : "group-hover:translate-x-1"
            )}>
                {label}
            </span>

            {isActive && (
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_10px_#FF7800]" 
                />
            )}
        </Link>
    );
}
