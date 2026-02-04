import Link from 'next/link';
import Image from 'next/image';

import { HeaderActions } from './HeaderActions';
import { getDashboardStats } from '@/modules/core/actions/stats';
import { requireAuth } from '@/modules/core/actions/auth';

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
        <div className="min-h-screen bg-slate-950 flex">
            {/* Sidebar */}
            {/* Sidebar */}
            <aside className="w-56 bg-[#0B1E3F] text-white flex flex-col fixed h-full shadow-2xl z-10 border-r border-blue-900/50">
                <div className="p-4 flex flex-col items-center border-b border-blue-900/50 bg-[#0B1E3F]">
                    <div className="relative w-40 h-24 mb-3 bg-white rounded-xl p-2 shadow-lg overflow-hidden backdrop-blur-sm">
                        <Image
                            src="/logo.jpg"
                            alt="Logo Familia Supermercados"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <span className="text-lg font-bold tracking-wider text-white">Sistema RH</span>
                    <span className="text-xs text-slate-400 uppercase tracking-widest mt-1">Portal do RH</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-blue-700/50 hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-lg group-hover:scale-110 transition-transform">🏠</span>
                        <span className="font-medium text-sm">Início</span>
                    </Link>

                    <div className="pt-4 pb-2">
                        <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Gestão</p>
                    </div>

                    <Link
                        href="/dashboard/personnel"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
                        <span className="font-medium text-sm">Pessoal</span>
                    </Link>



                    <Link
                        href="/dashboard/scales"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🗓️</span>
                        <span className="font-medium text-sm">Escalas</span>
                    </Link>

                    <Link
                        href="/dashboard/recruitment"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
                        <span className="font-medium text-sm">Recrutamento</span>
                    </Link>

                    <Link
                        href="/dashboard/onboarding"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">👋</span>
                        <span className="font-medium text-sm">Onboarding</span>
                    </Link>

                    <Link
                        href="/dashboard/time-tracking"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >

                        <span className="text-xl group-hover:scale-110 transition-transform">⏰</span>
                        <span className="font-medium text-sm">Ponto</span>
                    </Link>

                    <Link
                        href="/dashboard/vacations"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">🏖️</span>
                        <span className="font-medium text-sm">Férias</span>
                    </Link>

                    <Link
                        href="/dashboard/disciplinary"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">⚖️</span>
                        <span className="font-medium text-sm">Disciplinar</span>
                    </Link>

                    <Link
                        href="/dashboard/payroll"
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-[#FF7800] hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">💰</span>
                        <span className="font-medium text-sm">Folha de Pagamento</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-blue-900/50 space-y-2">
                    <Link
                        href="/dashboard/configuration"
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-slate-400 hover:bg-blue-700/50 hover:text-white transition-all duration-200 group"
                    >
                        <span className="text-lg group-hover:rotate-90 transition-transform duration-500">⚙️</span>
                        <span className="font-medium text-sm">Configurações</span>
                    </Link>
                    <button className="w-full flex items-center justify-center space-x-2 bg-slate-800/50 hover:bg-red-600/90 text-slate-300 hover:text-white py-2 rounded-lg transition-colors duration-200">
                        <span>🚪</span>
                        <span className="text-sm font-medium">Sair</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-56 p-8 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors">
                <header className="flex justify-between items-center mb-8 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
                    <div>
                        <h2 className="text-lg font-bold text-slate-950 dark:text-white">Bem-vindo, Gestor</h2>
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Portal Sistema RH</p>
                    </div>
                    <HeaderActions stats={stats || {}} />
                </header>
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div >
    );
}
