'use client';

import { useState } from 'react';
import { reviewMissionCompletion } from '@/modules/rewards/actions/coins';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

interface PendingCompletion {
    id: string;
    employee: { id: string; name: string; jobRole: { name: string } | null };
    task: { title: string; rewardAmount: number };
    proofText: string | null;
    createdAt: Date;
}

interface Props {
    initialPending: PendingCompletion[];
}

export function MissionApprovalManager({ initialPending }: Props) {
    const [completions, setCompletions] = useState<PendingCompletion[]>(initialPending);
    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        setLoadingId(id);
        const result = await reviewMissionCompletion(id, status);

        if (result.success) {
            setCompletions(completions.filter(c => c.id !== id));
            toast.success(status === 'APPROVED' ? 'Missão Aprovada! Moedas depositadas.' : 'Missão Rejeitada.');
        } else {
            toast.error(result.error || 'Erro ao processar.');
        }
        setLoadingId(null);
    };

    if (completions.length === 0) {
        return (
            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300">
                <span className="text-4xl block mb-4">✅</span>
                <p className="font-semibold text-slate-700 dark:text-slate-200 text-lg">Tudo em dia!</p>
                <p className="text-sm text-slate-500 mt-1">Nenhum envio de missão pendente de aprovação.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {completions.map((comp) => (
                <div key={comp.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border shadow-sm border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="text-lg">🎯</span> {comp.task.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Enviado por: {comp.employee.name}
                                </span>
                                <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                                    {comp.employee.jobRole?.name || 'Sem cargo'}
                                </span>
                                <span className="text-xs text-slate-400">
                                    {new Date(comp.createdAt).toLocaleDateString('pt-BR')} às {new Date(comp.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>

                            {comp.proofText && (
                                <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="font-semibold block mb-1 text-xs text-slate-400 uppercase tracking-wider">Comprovante / Mensagem:</span>
                                    {comp.proofText}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col items-end gap-3 min-w-[200px]">
                            <div className="text-center w-full px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-lg">
                                <span className="block text-[10px] font-bold text-yellow-600 dark:text-yellow-500 uppercase tracking-widest leading-tight">Valor da Recompensa</span>
                                <span className="text-xl font-black text-yellow-700 dark:text-yellow-400">🪙 {comp.task.rewardAmount}</span>
                            </div>

                            <div className="flex gap-2 w-full">
                                <Button
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    onClick={() => handleReview(comp.id, 'REJECTED')}
                                    disabled={loadingId === comp.id}
                                >
                                    Rejeitar
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => handleReview(comp.id, 'APPROVED')}
                                    disabled={loadingId === comp.id}
                                >
                                    Aprovar
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
