import { getReviewQuestions } from '@/modules/performance/actions/cycles';
import { QuestionsList } from '@/modules/performance/components/QuestionsList';
import Link from 'next/link';

export default async function PerformanceQuestionsPage() {
    const response = await getReviewQuestions();
    const questions = response.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">❓</span> Banco de Perguntas
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie as perguntas que serão usadas nos formulários de avaliação de desempenho.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/performance/cycles" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Voltar para Ciclos
                    </Link>
                </div>
            </div>

            <QuestionsList initialQuestions={questions as any} />
        </div>
    );
}
