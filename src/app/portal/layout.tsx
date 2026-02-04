
import { Toaster } from 'sonner';
import Link from 'next/link';
import { requireAuth } from '@/modules/core/actions/auth';

export default async function PortalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Verify Auth (EMPLOYEE only)
    await requireAuth(['EMPLOYEE']);

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Mobile Header */}
            <header className="bg-indigo-600 text-white p-4 shadow-md sticky top-0 z-50">
                <div className="flex justify-between items-center max-w-md mx-auto w-full">
                    <h1 className="text-lg font-bold">Portal do Colaborador</h1>
                    <div className="flex gap-2">
                        {/* Placeholder for User Menu */}
                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-xs font-bold border border-indigo-400">
                            E
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Centered for Desktop, Full for Mobile */}
            <main className="flex-1 w-full max-w-md mx-auto p-4 pb-20">
                {children}
            </main>

            {/* Bottom Navigation Bar (Mobile Style) */}
            <nav className="fixed bottom-0 w-full bg-white border-t border-slate-200 py-2 px-6 safe-area-bottom z-40 lg:hidden">
                <div className="flex justify-between items-center max-w-md mx-auto">
                    <Link href="/portal" className="flex flex-col items-center text-indigo-600">
                        <span className="text-2xl">🏠</span>
                        <span className="text-[10px] font-medium">Início</span>
                    </Link>
                    <Link href="/portal/time-tracking" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="text-2xl">⏰</span>
                        <span className="text-[10px] font-medium">Ponto</span>
                    </Link>
                    <Link href="/portal/payslips" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="text-2xl">💲</span>
                        <span className="text-[10px] font-medium">Holerite</span>
                    </Link>
                    <Link href="/portal/vacations" className="flex flex-col items-center text-slate-400 hover:text-indigo-600 transition-colors">
                        <span className="text-2xl">🏖️</span>
                        <span className="text-[10px] font-medium">Férias</span>
                    </Link>
                </div>
            </nav>

            {/* Desktop Helper Warning */}
            <div className="hidden lg:block fixed bottom-4 right-4 bg-yellow-50 text-yellow-800 p-4 rounded-lg border border-yellow-200 shadow-lg text-sm max-w-xs">
                <strong>Modo Portal:</strong> Esta interface foi desenhada para acesso móvel. Resolução limitada simulada.
            </div>

            <Toaster position="top-center" />
        </div>
    );
}
