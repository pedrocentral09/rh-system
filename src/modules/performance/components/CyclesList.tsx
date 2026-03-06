'use client';

import { useState } from 'react';
import { createEvaluationCycle, toggleCycleStatus, deleteEvaluationCycle } from '@/modules/performance/actions/cycles';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CycleWizard } from './CycleWizard';
import Link from 'next/link';

interface Cycle {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean | null;
    type: string | null;
    _count: { reviews: number };
}

export function CyclesList({ initialCycles }: { initialCycles: Cycle[] }) {
    const [cycles, setCycles] = useState<Cycle[]>(initialCycles);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleCycleStatus(id, !currentStatus);
        if (result.success) {
            setCycles(cycles.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
            toast.success(currentStatus ? 'Ciclo encerrado.' : 'Ciclo reaberto.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este ciclo e todas as avaliações contidas nele?')) return;

        const result = await deleteEvaluationCycle(id);
        if (result.success) {
            toast.success('Ciclo excluído.');
            setCycles(cycles.filter(c => c.id !== id));
        } else {
            toast.error('Erro ao excluir ciclo.');
        }
    };

    if (isCreating) {
        return (
            <CycleWizard
                onComplete={() => {
                    setIsCreating(false);
                    window.location.reload(); // Refresh to show new data or we could update state
                }}
                onCancel={() => setIsCreating(false)}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciar Ciclos</h2>
                    <p className="text-xs text-slate-500">Acompanhe o progresso das avaliações corporativas</p>
                </div>
                <Button onClick={() => setIsCreating(true)}>+ Iniciar Novo Ciclo</Button>
            </div>

            <div className="grid gap-4">
                {cycles.length === 0 && (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-4xl mb-4">🔄</div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum ciclo ativo</h3>
                        <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                            Inicie um novo ciclo de avaliação para começar a medir o desempenho da sua equipe.
                        </p>
                        <Button className="mt-6" onClick={() => setIsCreating(true)}>Criar Primeiro Ciclo</Button>
                    </div>
                )}
                {cycles.map(cycle => (
                    <div key={cycle.id} className="bg-white dark:bg-slate-800 border-l-4 rounded-xl shadow-sm flex items-center justify-between border-y border-r border-slate-200 dark:border-slate-700 group hover:border-indigo-300 dark:hover:border-indigo-900 transition-all overflow-hidden"
                        style={{ borderLeftColor: cycle.isActive ? '#10b981' : '#94a3b8' }}>

                        <Link href={`/dashboard/performance/cycles/${cycle.id}`} className="flex-1 p-5 pl-6 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{cycle.name}</h3>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cycle.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {cycle.isActive ? 'Em Andamento' : 'Encerrado'}
                                    </span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-4">
                                    <span className="flex items-center gap-1">🗓️ {format(new Date(cycle.startDate), 'dd/MM/yyyy')} até {format(new Date(cycle.endDate), 'dd/MM/yyyy')}</span>
                                    <span className="flex items-center gap-1 font-bold">👥 {cycle._count?.reviews || 0} avaliações</span>
                                    <span className="flex items-center gap-1 uppercase font-black text-[9px] bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded">🎯 {cycle.type}</span>
                                </div>
                            </div>
                            <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                                →
                            </div>
                        </Link>

                        <div className="flex items-center gap-2 pr-5 border-l border-slate-100 dark:border-slate-700 ml-4 pl-4 h-full">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleToggle(cycle.id, !!cycle.isActive);
                                }}
                                className={`text-[10px] uppercase px-3 py-1.5 rounded font-black transition-colors ${cycle.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                            >
                                {cycle.isActive ? 'Encerrar' : 'Reabrir'}
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleDelete(cycle.id);
                                }}
                                className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                                title="Excluir Ciclo"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
