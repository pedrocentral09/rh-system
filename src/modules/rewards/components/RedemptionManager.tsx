'use client';

import { useState } from 'react';
import { updateRedemptionStatus } from '@/modules/rewards/actions/coins';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Redemption {
    id: string;
    costAtTime: number;
    status: string;
    createdAt: Date;
    employee: { id: string; name: string; jobRole: { name: string } | null };
    reward: { title: string; imageUrl: string | null };
}

export function RedemptionManager({ redemptions: initialRedemptions }: { redemptions: Redemption[] }) {
    const [redemptions, setRedemptions] = useState<Redemption[]>(initialRedemptions);

    const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED' | 'DELIVERED') => {
        if (status === 'REJECTED' && !confirm('Tem certeza? Isso devolverá as moedas para o colaborador.')) return;

        const loadingToast = toast.loading('Processando...');

        const result = await updateRedemptionStatus(id, status);

        if (result.success) {
            toast.success(`Pedido marcado como ${status}`, { id: loadingToast });
            setRedemptions(redemptions.map(r => r.id === id ? { ...r, status } : r));
        } else {
            toast.error(result.error || 'Erro ao atualizar pedido', { id: loadingToast });
        }
    };

    const StatusBadge = ({ status }: { status: string }) => {
        switch (status) {
            case 'PENDING': return <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">Aguardando Avaliação</span>;
            case 'APPROVED': return <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Aprovado (Pendente Entrega)</span>;
            case 'DELIVERED': return <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold">Entregue / Concluído</span>;
            case 'REJECTED': return <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-xs font-bold line-through">Recusado (Estornado)</span>;
            default: return <span>{status}</span>;
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Colaborador</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Recompensa (Custo)</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {redemptions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    Nenhum pedido de resgate encontrado na loja de recompensas.
                                </td>
                            </tr>
                        )}
                        {redemptions.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 text-sm text-slate-600 whitespace-nowrap">
                                    {format(new Date(req.createdAt), 'dd/MM/yyyy HH:mm')}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-sm text-slate-800">{req.employee.name}</div>
                                    <div className="text-[10px] text-slate-500">{req.employee.jobRole?.name || 'Sem cargo'}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center text-sm border border-slate-200 overflow-hidden shrink-0">
                                            {req.reward.imageUrl ? <img src={req.reward.imageUrl} alt="" className="w-full h-full object-cover" /> : '🎁'}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-sm text-slate-800">{req.reward.title}</div>
                                            <div className="text-xs text-amber-600 font-bold flex items-center"><span className="mr-1">🪙</span>{req.costAtTime} coins</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={req.status} />
                                </td>
                                <td className="p-4 text-right">
                                    {req.status === 'PENDING' && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleUpdateStatus(req.id, 'REJECTED')} className="text-xs px-3 py-1.5 rounded font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                                                Recusar
                                            </button>
                                            <button onClick={() => handleUpdateStatus(req.id, 'APPROVED')} className="text-xs px-3 py-1.5 rounded font-semibold bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors">
                                                Aprovar Pedido
                                            </button>
                                        </div>
                                    )}
                                    {req.status === 'APPROVED' && (
                                        <button onClick={() => handleUpdateStatus(req.id, 'DELIVERED')} className="text-xs px-3 py-1.5 rounded font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                                            Marcar como Entregue
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
