import Link from 'next/link';
import Image from 'next/image';
import { HeaderActions } from './HeaderActions';
import { getDashboardStats } from '@/modules/core/actions/stats';
import { requireAuth, logoutAction } from '@/modules/core/actions/auth';
import { Toaster } from 'sonner';
import { AppSidebar } from './components/AppSidebar';

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
        <div className="min-h-screen bg-[#020617] flex font-sans selection:bg-brand-orange selection:text-white overflow-x-hidden">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main Content */}
            <main className="flex-1 min-h-screen transition-all duration-500 relative pl-5">
                {/* Modern Glass Header */}
                <header className="sticky top-0 z-20 px-8 py-5 flex justify-between items-center bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
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
                </header>

                <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative z-10">
                        {children}
                    </div>

                    {/* Ambient Glow Effects */}
                    <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-brand-blue/20 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />
                    <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-brand-orange/10 blur-[100px] rounded-full -z-10 pointer-events-none opacity-30" />
                </div>
            </main>
            <Toaster position="top-right" richColors theme="dark" />
        </div >
    );
}
