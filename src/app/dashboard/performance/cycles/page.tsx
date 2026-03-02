import { getEvaluationCycles } from '@/modules/performance/actions/cycles';
import { CyclesList } from '@/modules/performance/components/CyclesList';
import Link from 'next/link';

export default async function PerformanceCyclesPage() {
    const response = await getEvaluationCycles();
    const cycles = response.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🔄</span> Ciclos de Avaliação
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie os períodos de avaliação de desempenho contínua da empresa.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/performance/questions" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Banco de Perguntas
                    </Link>
                </div>
            </div>

            <CyclesList initialCycles={cycles as any} />
        </div>
    );
}
