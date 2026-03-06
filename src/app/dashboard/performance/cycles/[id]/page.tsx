import { getCycleWithDetails } from '@/modules/performance/actions/cycles';
import { CycleDetails } from '@/modules/performance/components/CycleDetails';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CycleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const response = await getCycleWithDetails(id);

    console.log("== CYCLE RESPONSE ==", response);

    if (!response.success || !response.data) {
        return notFound();
    }

    const cycle = response.data;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🔄</span> Gestão do Ciclo
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Acompanhe o progresso das avaliações e gerencie participantes.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/performance/cycles"
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
                    >
                        Voltar para Lista
                    </Link>
                </div>
            </div>

            <CycleDetails cycle={cycle as any} />
        </div>
    );
}
