
import { Toaster } from 'sonner';
import { requireAuth } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { PortalSidebar } from './components/PortalSidebar';
import { PortalBottomNav } from './components/PortalBottomNav';
import { PortalHeader } from './components/PortalHeader';
import { FloatingChat } from './components/FloatingChat';

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Verify Auth (EMPLOYEE only)
    const user = await requireAuth(['EMPLOYEE']);

    // 2. Fetch Employee Data
    const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        select: {
            name: true,
            pinMustChange: true
        }
    });

    const employeeName = employee?.name || "Colaborador";

    // 3. Security Check: Force PIN change if required
    const headerList = await headers();
    const pathname = headerList.get('x-pathname') || '';
    const isChangePinPage = pathname.includes('/portal/change-pin');

    if (employee?.pinMustChange && !isChangePinPage) {
        redirect('/portal/change-pin');
    }

    return (
        <div className="h-[100dvh] bg-[#0A0F1C] text-slate-100 font-sans overflow-hidden relative">
            {/* Ambient Glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-blue/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 opacity-[0.03] z-[9999] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
            </div>

            <div className="flex h-full relative z-10 overflow-hidden">
                {/* Desktop Sidebar - Glass */}
                <div className="hidden md:block w-72 h-full border-r border-white/5 bg-white/[0.01] backdrop-blur-3xl shrink-0">
                    <PortalSidebar employeeName={employeeName} />
                </div>

                <div className="flex-1 flex flex-col min-w-0 h-full relative">
                    {/* Header - Sticky for Mobile */}
                    <PortalHeader employeeName={employeeName} />

                    {/* Content Scroll Area */}
                    <main className="flex-1 overflow-y-auto overflow-x-hidden pt-6 px-4 md:px-12 pb-32 md:pb-12 scroll-smooth">
                        <div className="max-w-4xl mx-auto">
                            {children}
                        </div>
                    </main>

                    {/* Floating Bottom Nav for Mobile */}
                    <PortalBottomNav />
                </div>
            </div>

            <FloatingChat />
            <Toaster position="top-center" richColors theme="dark" />
        </div>
    );
}
