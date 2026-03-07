import Link from 'next/link';
import Image from 'next/image';
import { HeaderActions } from './HeaderActions';
import { getDashboardStats } from '@/modules/core/actions/stats';
import { requireAuth, logoutAction } from '@/modules/core/actions/auth';
import { Toaster } from 'sonner';
import { AppSidebar } from './components/AppSidebar';
import { TopBar } from './components/TopBar';

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
            <main className="flex-1 min-h-screen transition-all duration-500 relative pl-5 pt-8">
                {/* Topbar (Auto-hiding) */}
                <TopBar stats={stats || {}} />

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
