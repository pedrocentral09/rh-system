import Link from 'next/link';
import Image from 'next/image';

import { HeaderActions } from './HeaderActions';
import { getDashboardStats } from '@/modules/core/actions/stats';
import { requireAuth } from '@/modules/core/actions/auth';
import { Toaster } from 'sonner';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Fetch stats for notifications
    const { data: stats } = await getDashboardStats();

    // Verify Auth (ADMIN or HR)
    await requireAuth(['ADMIN', 'HR', 'MANAGER']);


    return (
        <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-brand-orange selection:text-white">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0A0F1C] text-white flex flex-col fixed h-full z-30 border-r border-white/5">
                <div className="p-8 flex flex-col items-center">
                    <div className="relative w-full aspect-[2/1] mb-6 bg-white rounded-2xl p-4 shadow-2xl shadow-black/50 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Image
                            src="/logo.jpg"
                            alt="Logo Familia Supermercados"
                            fill
                            className="object-contain p-2"
                            priority
                        />
                    </div>
                    <div className="text-center">
                        <span className="text-sm font-black tracking-[0.2em] text-white uppercase bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">Sistema RH</span>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <div className="h-1 w-1 rounded-full bg-brand-orange animate-pulse" />
                            <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest leading-none">Console de Gestão</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1 custom-scrollbar">
                    <div className="px-4 py-2">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Visão Geral</p>
                    </div>

                    <SidebarLink href="/dashboard" icon="🏠" label="Início" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Pessoas & Operação</p>
                    </div>

                    <SidebarLink href="/dashboard/personnel" icon="👥" label="Colaboradores" />
                    <SidebarLink href="/dashboard/scales" icon="🗓️" label="Escalas de Trabalho" />
                    <SidebarLink href="/dashboard/recruitment" icon="📢" label="Recrutamento" />
                    <SidebarLink href="/dashboard/time-tracking" icon="⏰" label="Controle de Ponto" />
                    <SidebarLink href="/dashboard/vacations" icon="🏖️" label="Férias & Licenças" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Financeiro & Carreira</p>
                    </div>

                    <SidebarLink href="/dashboard/payroll" icon="💰" label="Folha de Pagamento" />
                    <SidebarLink href="/dashboard/career" icon="🌳" label="Plano de Carreira" />
                    <SidebarLink href="/dashboard/performance/cycles" icon="📊" label="Ciclos de Desempenho" />
                    <SidebarLink href="/dashboard/rewards/catalog" icon="🪙" label="Família Coins" color="text-amber-500" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Comunicação</p>
                    </div>

                    <SidebarLink href="/dashboard/communications" icon="💬" label="Atendimento" />

                    <div className="pt-6 pb-2 px-4">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Utilidades</p>
                    </div>

                    <SidebarLink href="/dashboard/tools/admission-form" icon="📋" label="Ficha Admissão" />
                </nav>

                <div className="p-6 border-t border-white/5 space-y-3">
                    <Link
                        href="/dashboard/configuration"
                        className="flex items-center space-x-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-300 group"
                    >
                        <span className="text-lg group-hover:rotate-90 transition-transform duration-500">⚙️</span>
                        <span className="font-bold text-[11px] uppercase tracking-wider">Configurações</span>
                    </Link>
                    <button className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white py-3 rounded-xl transition-all duration-300 font-black text-[10px] uppercase tracking-widest border border-rose-500/20 group">
                        <span className="group-hover:-translate-x-1 transition-transform">🚪</span>
                        Sair do Sistema
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen transition-colors relative">
                {/* Modern Glass Header */}
                <header className="sticky top-0 z-20 px-8 py-5 flex justify-between items-center bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                    <div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">
                            <span className="text-brand-orange">Painel Administrativo</span>
                            <span className="opacity-30">/</span>
                            <span>Gestão de Unidades</span>
                        </div>
                        <h2 className="text-lg font-black text-white uppercase tracking-tighter">
                            Excelência <span className="text-brand-orange">Operacional</span>
                        </h2>
                    </div>
                    <HeaderActions stats={stats || {}} />
                </header>

                <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative z-10">
                        {children}
                    </div>

                    {/* Ambient Glow Effects */}
                    <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />
                    <div className="fixed bottom-0 left-64 w-[400px] h-[400px] bg-brand-orange/10 blur-[100px] rounded-full -z-10 pointer-events-none opacity-30" />
                </div>
            </main>
            <Toaster position="top-right" richColors theme="dark" />
        </div >
    );
}

function SidebarLink({ href, icon, label, color = "text-slate-400" }: { href: string, icon: string, label: string, color?: string }) {
    return (
        <Link
            href={href}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all duration-300 group relative overflow-hidden`}
        >
            <div className="absolute inset-y-0 left-0 w-1 bg-brand-orange transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 rounded-r-full" />
            <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
            <span className={`font-bold text-[11px] uppercase tracking-wider ${color} group-hover:text-white transition-colors`}>{label}</span>
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    );
}
