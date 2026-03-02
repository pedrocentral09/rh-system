'use client';

import { useState } from 'react';
import { createMission, toggleMissionStatus, deleteMission } from '@/modules/rewards/actions/coins';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

interface Mission {
    id: string;
    title: string;
    description: string | null;
    rewardAmount: number;
    isActive: boolean | null;
    _count?: {
        completions: number;
    };
}

interface Props {
    initialMissions: Mission[];
}

export function MissionManager({ initialMissions }: Props) {
    const [missions, setMissions] = useState<Mission[]>(initialMissions);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [rewardAmount, setRewardAmount] = useState('50');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!title.trim() || !rewardAmount) return;
        setLoading(true);

        const result = await createMission({
            title: title.trim(),
            description: description.trim() || undefined,
            rewardAmount: parseInt(rewardAmount),
        });

        if (result.success && result.data) {
            setMissions([{ ...result.data, _count: { completions: 0 } }, ...missions]);
            setTitle('');
            setDescription('');
            setRewardAmount('50');
            toast.success('Missão criada com sucesso!');
        } else {
            toast.error(result.error || 'Erro ao criar missão');
        }
        setLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleMissionStatus(id, !currentStatus);
        if (result.success) {
            setMissions(missions.map(m => m.id === id ? { ...m, isActive: !currentStatus } : m));
            toast.success(currentStatus ? 'Missão desativada' : 'Missão ativada');
        } else {
            toast.error('Erro ao alterar status');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta missão?')) return;
        const result = await deleteMission(id);
        if (result.success) {
            setMissions(missions.filter(m => m.id !== id));
            toast.success('Missão excluída');
        } else {
            toast.error('Erro ao excluir missão');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>🎯</span> Criar Nova Missão
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Título da Missão</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Ler o livro do mês, Indicar um amigo..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recompensa (Coins)</label>
                        <Input
                            type="number"
                            value={rewardAmount}
                            onChange={(e) => setRewardAmount(e.target.value)}
                            placeholder="Ex: 50"
                            min="1"
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição / Regras (Opcional)</label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Detalhes sobre como o colaborador deve provar que concluiu a missão."
                        />
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <Button onClick={handleCreate} disabled={loading || !title.trim()}>
                        Salvar Missão
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.length === 0 && (
                    <div className="col-span-full text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300">
                        Nenhuma missão cadastrada ainda.
                    </div>
                )}

                {missions.map(mission => (
                    <div key={mission.id} className={`bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm flex flex-col justify-between ${mission.isActive ? 'border-blue-200 dark:border-blue-800' : 'border-slate-200 opacity-75'}`}>
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white leading-tight pr-4">
                                    {mission.title}
                                </h4>
                                <span className="flex-shrink-0 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-400 font-bold px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm">
                                    🪙 {mission.rewardAmount}
                                </span>
                            </div>
                            {mission.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                                    {mission.description}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-2">
                            <span className="text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded">
                                {mission._count?.completions || 0} envios
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleToggle(mission.id, !!mission.isActive)}
                                    className={`text-xs font-bold px-3 py-1.5 rounded transition-colors ${mission.isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                >
                                    {mission.isActive ? 'Desativar' : 'Ativar'}
                                </button>
                                <button
                                    onClick={() => handleDelete(mission.id)}
                                    className="text-xs font-bold px-3 py-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

