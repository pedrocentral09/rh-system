import { getClimateSurveys } from '@/modules/performance/actions/climate';
import { getEmployeeEvaluationRoutines } from '@/modules/performance/actions/routines';
import { getReviewQuestions, getEvaluationCycles } from '@/modules/performance/actions/cycles';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { PerformanceRoutines } from '@/modules/performance/components/PerformanceRoutines';
import { QuestionsList } from '@/modules/performance/components/QuestionsList';
import { PerformanceAutomation } from '@/modules/performance/components/PerformanceAutomation';
import { getAutomationSettings } from '@/modules/performance/actions/automation';
import { Card, CardContent } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { TemplateManager } from '@/modules/performance/components/TemplateManager';
import { CyclesList } from '@/modules/performance/components/CyclesList';

export default async function PerformanceDashboardPage() {
    const [climateResult, routineResult, questionsResult, automationResult, cyclesResult] = await Promise.all([
        getClimateSurveys(),
        getEmployeeEvaluationRoutines(),
        getReviewQuestions(),
        getAutomationSettings(),
        getEvaluationCycles()
    ]);

    const climateData = climateResult.data || { surveys: [], stats: { total: 0, promoters: 0, passives: 0, detractors: 0, npsScore: 0 } };
    const { surveys, stats } = climateData;
    const employees = routineResult.data || [];
    const questions = questionsResult.data || [];
    const cycles = cyclesResult.data || [];
    const automationSettings = automationResult.success ? automationResult.data : null;

    // NPS Ranges: -100 to 0 (Critical), 1 to 50 (Improvement), 51 to 75 (Good), 76 to 100 (Excellent)
    let npsZone = 'Crítica';
    let npsColor = 'text-red-600';
    let npsBg = 'bg-red-50 border-red-200';

    if (stats.npsScore > 0 && stats.npsScore <= 50) {
        npsZone = 'Aperfeiçoamento';
        npsColor = 'text-amber-600';
        npsBg = 'bg-amber-50 border-amber-200';
    } else if (stats.npsScore > 50 && stats.npsScore <= 75) {
        npsZone = 'Qualidade';
        npsColor = 'text-emerald-600';
        npsBg = 'bg-emerald-50 border-emerald-200';
    } else if (stats.npsScore > 75) {
        npsZone = 'Excelência';
        npsColor = 'text-indigo-600';
        npsBg = 'bg-indigo-50 border-indigo-200';
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">📊</span> Desempenho & Clima
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Visão geral do clima organizacional e gestão de avaliações.
                    </p>
                </div>
                <div className="flex gap-2">
                </div>
            </div>

            <Tabs defaultValue="clima" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <TabsTrigger value="clima" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        🌈 Clima (e-NPS)
                    </TabsTrigger>
                    <TabsTrigger value="rotinas" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        📅 Rotinas
                    </TabsTrigger>
                    <TabsTrigger value="modelos" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        Templates
                    </TabsTrigger>
                    <TabsTrigger value="perguntas" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        ❓ Banco de Perguntas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="clima" className="space-y-6 outline-none">
                    {/* e-NPS Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main NPS Score */}
                        <div className={`col-span-1 rounded-2xl p-6 border shadow-sm flex flex-col items-center justify-center text-center ${npsBg}`}>
                            <h3 className="font-bold text-slate-700 dark:text-slate-600 uppercase tracking-wider text-sm mb-2">e-NPS Atual</h3>
                            <div className={`text-6xl font-black mb-1 ${npsColor}`}>
                                {stats.npsScore}
                            </div>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full bg-white/50 ${npsColor}`}>
                                Zona de {npsZone}
                            </span>
                            <p className="text-xs text-slate-500 mt-4">
                                Baseado em {stats.total} respostas recentes
                            </p>
                        </div>

                        {/* Score Breakdown */}
                        <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200 dark:border-slate-700">
                            <CardContent className="p-6 h-full flex flex-col justify-center">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-6">Composição do e-NPS</h3>
                                <div className="space-y-4">
                                    {/* Promoters */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-emerald-700 flex items-center gap-2">🟢 Promotores (9-10)</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{stats.promoters} ({stats.total > 0 ? Math.round((stats.promoters / stats.total) * 100) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.promoters / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    {/* Passives */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-amber-600 flex items-center gap-2">🟡 Passivos (7-8)</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{stats.passives} ({stats.total > 0 ? Math.round((stats.passives / stats.total) * 100) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.passives / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                    {/* Detractors */}
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium text-red-600 flex items-center gap-2">🔴 Detratores (0-6)</span>
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{stats.detractors} ({stats.total > 0 ? Math.round((stats.detractors / stats.total) * 100) : 0}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${stats.total > 0 ? (stats.detractors / stats.total) * 100 : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Feedback Feed */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700">
                            <h3 className="font-bold text-slate-800 dark:text-white">🗣️ Feedbacks Recentes (Anônimos)</h3>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {surveys.filter((s: any) => s.comment && s.comment.trim() !== '').length === 0 && (
                                <div className="p-8 text-center text-slate-500 italic">
                                    Nenhum comentário deixado nas pesquisas recentes.
                                </div>
                            )}
                            {surveys.filter((s: any) => s.comment && s.comment.trim() !== '').slice(0, 10).map((survey: any) => (
                                <div key={survey.id} className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mb-2 ${survey.score >= 9 ? 'bg-emerald-100 text-emerald-700' : survey.score <= 6 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                Nota: {survey.score}
                                            </span>
                                            <p className="text-slate-700 dark:text-slate-300 text-sm whitespace-pre-wrap italic">"{survey.comment}"</p>
                                        </div>
                                        <span className="text-xs text-slate-400 whitespace-nowrap ml-4 uppercase">
                                            {format(new Date(survey.date), "dd 'de' MMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="rotinas" className="outline-none">
                    <PerformanceRoutines employees={employees as any} />
                </TabsContent>

                <TabsContent value="modelos" className="outline-none">
                    <TemplateManager />
                </TabsContent>

                <TabsContent value="perguntas" className="outline-none">
                    <QuestionsList initialQuestions={questions as any} />
                </TabsContent>

                <TabsContent value="ciclos" className="outline-none">
                    <CyclesList initialCycles={cycles as any} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
