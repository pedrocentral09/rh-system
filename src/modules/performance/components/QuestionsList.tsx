'use client';

import { useState } from 'react';
import { createReviewQuestion, toggleQuestionStatus } from '@/modules/performance/actions/cycles';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

interface Question {
    id: string;
    category: string;
    text: string;
    weight: number;
    isActive: boolean;
}

const CATEGORIES = ['CULTURA', 'TECNICO', 'LIDERANCA', 'COMPORTAMENTAL'];

export function QuestionsList({ initialQuestions }: { initialQuestions: Question[] }) {
    const [questions, setQuestions] = useState<Question[]>(initialQuestions);
    const [isCreating, setIsCreating] = useState(false);
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [text, setText] = useState('');
    const [weight, setWeight] = useState(1);
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createReviewQuestion({ category, text, weight });

        if (result.success && result.data) {
            toast.success('Pergunta adicionada!');
            setQuestions([...questions, result.data]);
            setIsCreating(false);
            setText('');
        } else {
            toast.error(result.error || 'Erro ao criar pergunta');
        }
        setLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleQuestionStatus(id, !currentStatus);
        if (result.success) {
            setQuestions(questions.map(q => q.id === id ? { ...q, isActive: !currentStatus } : q));
        }
    };

    const grouped = questions.reduce((acc, q) => {
        if (!acc[q.category]) acc[q.category] = [];
        acc[q.category].push(q);
        return acc;
    }, {} as Record<string, Question[]>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Banco de Perguntas</h2>
                    <p className="text-xs text-slate-500">Cadastre perguntas para as avaliações de desempenho</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>+ Nova Pergunta</Button>
                )}
            </div>

            {isCreating && (
                <div className="bg-emerald-50 dark:bg-slate-800 p-6 rounded-xl border border-emerald-100 dark:border-slate-700">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="col-span-12 md:col-span-3">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Categoria</label>
                                <select
                                    required
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg dark:bg-slate-900 border"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="col-span-12 md:col-span-7">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Pergunta</label>
                                <Input required value={text} onChange={e => setText(e.target.value)} placeholder="Ex: Demonstra colaboração e trabalho em equipe?" />
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Peso</label>
                                <Input required type="number" min="0.1" step="0.1" value={weight} onChange={e => setWeight(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-6">
                {Object.entries(grouped).map(([cat, catsQuestions]) => (
                    <div key={cat} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                            <h3 className="font-bold text-sm text-slate-700 uppercase tracking-wider">{cat}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {catsQuestions.map(q => (
                                <div key={q.id} className={`p-4 flex items-center justify-between ${!q.isActive ? 'opacity-50 grayscale' : ''}`}>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{q.text}</p>
                                        <p className="text-[10px] text-slate-500 mt-1 uppercase">Peso: {q.weight}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(q.id, q.isActive)}
                                        className={`text-xs px-3 py-1 rounded font-semibold transition-colors ${q.isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                    >
                                        {q.isActive ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {questions.length === 0 && (
                    <p className="text-center text-slate-500 py-10">Nenhuma pergunta cadastrada.</p>
                )}
            </div>
        </div>
    );
}
