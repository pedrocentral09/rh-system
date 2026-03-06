import { getEmployee } from '@/modules/personnel/actions/employees';
import { SelfOnboardingForm } from '@/modules/personnel/components/SelfOnboardingForm';
import { Card, CardContent } from '@/shared/components/ui/card';
import { UserCheck } from 'lucide-react';
import { notFound } from 'next/navigation';

interface OnboardingPageProps {
    params: {
        id: string;
    };
}

export default async function OnboardingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const result = await getEmployee(id);

    if (!result.success || !result.data) {
        return notFound();
    }

    const employee = result.data;

    // Security check: only allow onboarding if status is WAITING_ONBOARDING
    if (employee.status !== 'WAITING_ONBOARDING') {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
                <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-center p-8">
                    <div className="h-20 w-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserCheck className="h-10 w-10 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Cadastro Concluído!</h1>
                    <p className="text-slate-400">
                        Obrigado, {employee.name.split(' ')[0]}! Seus dados já foram enviados e estão sendo analisados pelo nosso RH.
                    </p>
                    <div className="mt-8 pt-8 border-t border-slate-800">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Status do Cadastro</p>
                        <span className="mt-2 inline-block px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-sm font-semibold border border-indigo-500/20">
                            {employee.status === 'PENDING_APPROVAL' ? 'Em Análise' : 'Finalizado'}
                        </span>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#001B3D] text-slate-100 flex flex-col relative overflow-hidden font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF7800]/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FF7800]/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10 flex-1 flex flex-col">
                {/* Brand Logo Header */}
                <header className="px-6 py-8 flex justify-center">
                    <div className="flex flex-col items-center gap-2">
                        <div className="bg-white/5 backdrop-blur-md p-4 rounded-3xl border border-white/10 shadow-2xl">
                            <img
                                src="/logo.jpg"
                                alt="Rede Família"
                                className="h-12 w-auto object-contain rounded-lg"
                            />
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.3em] text-[#FF7800] font-black mt-2">
                            Portal de Autocadastro
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 pb-20">
                    <SelfOnboardingForm employee={employee} />
                </main>

                <footer className="py-6 text-center opacity-30 select-none pointer-events-none">
                    <p className="text-[10px] uppercase tracking-widest font-bold">
                        &copy; {new Date().getFullYear()} Sistema de Recrutamento • REDE FAMÍLIA
                    </p>
                </footer>
            </div>
        </div>
    );
}
