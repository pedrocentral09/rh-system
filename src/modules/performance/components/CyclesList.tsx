'use client';

import { useState } from 'react';
import { createEvaluationCycle, toggleCycleStatus, deleteEvaluationCycle } from '@/modules/performance/actions/cycles';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [type, setType] = useState('360');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createEvaluationCycle({
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type,
        });

        if (result.success && result.data) {
            toast.success('Ciclo criado com sucesso!');
            setCycles([{ ...result.data, _count: { reviews: 0 } }, ...cycles]);
            setIsCreating(false);
            setName('');
            setStartDate('');
            setEndDate('');
        } else {
            toast.error(result.error || 'Erro ao criar ciclo');
        }
        setLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleCycleStatus(id, !currentStatus);
        if (result.success) {
            setCycles(cycles.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este ciclo e todas as avaliações contidas nela?')) return;

        const result = await deleteEvaluationCycle(id);
        if (result.success) {
            toast.success('Ciclo excluído.');
            setCycles(cycles.filter(c => c.id !== id));
        } else {
            toast.error('Erro ao excluir ciclo.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciar Ciclos</h2>
                    <p className="text-xs text-slate-500">Crie períodos temporais para avaliações</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>+ Novo Ciclo</Button>
                )}
            </div>

            {isCreating && (
                <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-xl border border-blue-100 dark:border-slate-700">
                    <h3 className="font-bold text-sm mb-4">Criar Novo Ciclo de Avaliação</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Nome do Ciclo</label>
                                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Q1 2026 - Família Supermercados" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Tipo de Ciclo</label>
                                <select
                                    required
                                    value={type}
                                    onChange={e => setType(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg dark:bg-slate-900 border"
                                >
                                    <option value="360">Avaliação 360º (Pares, Gestor e Auto)</option>
                                    <option value="TOP_DOWN">Top Down (Apenas Gestor avalia)</option>
                                    <option value="SELF">Autoavaliação (Apenas Colaborador)</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Data de Início</label>
                                <Input required type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Data de Encerramento</label>
                                <Input required type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar Ciclo'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {cycles.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                        <p className="text-slate-500">Nenhum ciclo criado.</p>
                    </div>
                )}
                {cycles.map(cycle => (
                    <div key={cycle.id} className="bg-white dark:bg-slate-800 p-5 pl-6 border-l-4 rounded-xl shadow-sm flex items-center justify-between border-y border-r border-slate-200 dark:border-slate-700"
                        style={{ borderLeftColor: cycle.isActive ? '#10b981' : '#94a3b8' }}>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">{cycle.name}</h3>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${cycle.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                                    {cycle.isActive ? 'Em Andamento' : 'Encerrado'}
                                </span>
                            </div>
                            <div className="text-sm text-slate-500 flex items-center gap-4">
                                <span>🗓️ {format(new Date(cycle.startDate), 'dd/MM/yyyy')} até {format(new Date(cycle.endDate), 'dd/MM/yyyy')}</span>
                                <span>👥 {cycle._count.reviews} avaliações</span>
                                <span>🎯 Tipo: {cycle.type}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleToggle(cycle.id, !!cycle.isActive)}
                                className={`text-xs px-3 py-1.5 rounded font-semibold transition-colors ${cycle.isActive ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                            >
                                {cycle.isActive ? 'Encerrar' : 'Reabrir'}
                            </button>
                            <button
                                onClick={() => handleDelete(cycle.id)}
                                className="text-red-500 hover:text-red-700 p-2"
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
