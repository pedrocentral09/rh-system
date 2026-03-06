'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Review {
    id: string;
    status: string | null;
    evaluator: { name: string } | null;
    evaluated: { name: string } | null;
}

interface CycleDetailsProps {
    cycle: {
        id: string;
        name: string;
        startDate: Date;
        endDate: Date;
        type: string | null;
        isActive: boolean | null;
        reviews: Review[];
        template?: {
            name: string;
            description: string | null;
            questions: {
                id: string;
                category: string;
                text: string;
                weight: number | null;
            }[];
        } | null;
    };
}

export function CycleDetails({ cycle }: CycleDetailsProps) {
    const [reviews, setReviews] = useState(cycle.reviews);
    const [filter, setFilter] = useState('ALL');

    const total = reviews.length;
    const completed = reviews.filter(r => r.status === 'COMPLETED').length;
    const pending = reviews.filter(r => r.status === 'PENDING').length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const filteredReviews = reviews.filter(r => {
        if (filter === 'ALL') return true;
        return r.status === filter;
    });

    return (
        <div className="space-y-6">
            {/* Header / Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <span>🔄</span> {cycle.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
                            <span>Progresso Geral</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-900 h-3 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-4 flex gap-4 text-xs">
                            <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-400">
                                🗓️ {format(new Date(cycle.startDate), 'dd/MM/yyyy')} - {format(new Date(cycle.endDate), 'dd/MM/yyyy')}
                            </span>
                            <span className="flex items-center gap-1.5 font-medium text-indigo-600 uppercase">
                                🎯 {cycle.type}
                            </span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-slate-800 dark:text-white">{total}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Total Avaliações</div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <div className="text-3xl font-black text-emerald-600">{completed}</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Concluídas</div>
                    </CardContent>
                </Card>
            </div>

            {/* Template Info (If Available) */}
            {cycle.template && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">📋 Modelo Utilizado: {cycle.template.name}</h3>
                    <div className="text-xs text-slate-500 mb-3">{cycle.template.description || 'Sem descrição'}</div>
                    {cycle.template.questions && cycle.template.questions.length > 0 && (
                        <div className="space-y-2 mt-4">
                            <h4 className="text-xs font-bold text-slate-600 uppercase">Perguntas a serem avaliadas ({cycle.template.questions.length})</h4>
                            <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 pl-4 space-y-1">
                                {cycle.template.questions.map((q: any) => (
                                    <li key={q.id}>
                                        <span className="font-semibold">[{q.category}]</span> {q.text} <span className="opacity-50">(Peso {q.weight})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Actions & Filters */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'ALL' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => setFilter('PENDING')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'PENDING' ? 'bg-white dark:bg-slate-800 shadow-sm text-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pendentes ({pending})
                    </button>
                    <button
                        onClick={() => setFilter('COMPLETED')}
                        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${filter === 'COMPLETED' ? 'bg-white dark:bg-slate-800 shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Concluídas ({completed})
                    </button>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 text-xs">Baixar Relatório (CSV)</Button>
                    <Button size="sm" className="h-9 text-xs">Enviar Lembrete Geral 🔔</Button>
                </div>
            </div>

            {/* Reviews List */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">Avaliado</th>
                            <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">Avaliador</th>
                            <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredReviews.map(review => (
                            <tr key={review.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-200">
                                    {review.evaluated?.name || 'Desconhecido'}
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400 italic">
                                    {review.evaluator?.name || 'Sistema (Top-Down)'}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${review.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {review.status === 'COMPLETED' ? 'Concluído' : 'Pendente'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-indigo-600 hover:text-indigo-800 text-xs font-bold uppercase transition-colors">
                                        Monitorar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
