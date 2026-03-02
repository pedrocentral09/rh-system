'use client';

import { useState } from 'react';
import { requestRedemption, submitMissionCompletion } from '@/modules/rewards/actions/coins';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Reward {
    id: string;
    title: string;
    description: string | null;
    cost: number;
    stock: number | null;
    isActive: boolean;
    imageUrl: string | null;
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    description: string;
    createdAt: Date;
}

interface Mission {
    id: string;
    title: string;
    description: string | null;
    rewardAmount: number;
    isActive: boolean;
}

interface Props {
    balance: number;
    transactions: Transaction[];
    catalog: Reward[];
    missions: Mission[];
}

export function EmployeeRewardsPortal({ balance: initialBalance, transactions: initialTransactions, catalog, missions }: Props) {
    const [balance, setBalance] = useState(initialBalance);
    const [transactions, setTransactions] = useState(initialTransactions);
    const [activeTab, setActiveTab] = useState<'LOJA' | 'MISSOES' | 'HISTORICO'>('LOJA');
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    // Mission states
    const [submittingMission, setSubmittingMission] = useState<string | null>(null);
    const [proofTexts, setProofTexts] = useState<Record<string, string>>({});

    const handleRedeem = async (reward: Reward) => {
        if (balance < reward.cost) {
            toast.error('Saldo insuficiente');
            return;
        }

        if (!confirm(`Deseja resgatar "${reward.title}" por ${reward.cost} Família Coins?`)) return;

        setLoadingIds(prev => [...prev, reward.id]);

        const result = await requestRedemption(reward.id);

        if (result.success) {
            toast.success('Pedido de resgate enviado com sucesso! 🎉');
            setBalance(prev => prev - reward.cost);
            // Simulate adding transaction to local state
            setTransactions(prev => [{
                id: Math.random().toString(),
                amount: -reward.cost,
                type: 'SPENT',
                description: `Resgate pendente: ${reward.title}`,
                createdAt: new Date()
            }, ...prev]);
        } else {
            toast.error(result.error || 'Erro ao processar resgate');
        }

        setLoadingIds(prev => prev.filter(id => id !== reward.id));
    };

    const handleSubmitMission = async (missionId: string) => {
        const proof = proofTexts[missionId];
        if (!proof || !proof.trim()) {
            toast.error('Informe como você cumpriu esta missão ou envie um link/texto de comprovante.');
            return;
        }

        setSubmittingMission(missionId);

        const result = await submitMissionCompletion(missionId, proof.trim());

        if (result.success) {
            toast.success('Comprovante enviado! O RH fará a análise em breve e as moedas cairão na sua conta.');
            // Clear input
            setProofTexts(prev => ({ ...prev, [missionId]: '' }));
        } else {
            toast.error(result.error || 'Erro ao enviar a missão');
        }

        setSubmittingMission(null);
    };

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-gradient-to-r from-amber-400 to-amber-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full blur-3xl opacity-20 -mr-10 -mt-20"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-semibold uppercase tracking-wider mb-2 text-amber-50">Seu Saldo</span>
                    <div className="flex items-center gap-2">
                        <span className="text-5xl">🪙</span>
                        <span className="text-6xl font-black">{balance}</span>
                    </div>
                    <span className="mt-2 text-sm text-amber-100 font-medium">Família Coins</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                    onClick={() => setActiveTab('LOJA')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'LOJA' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    🛍️ Lojinha
                </button>
                <button
                    onClick={() => setActiveTab('MISSOES')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'MISSOES' ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    🎯 Missões
                </button>
                <button
                    onClick={() => setActiveTab('HISTORICO')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'HISTORICO' ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    📜 Histórico
                </button>
            </div>

            {activeTab === 'LOJA' && (
                <div className="space-y-4">
                    <h2 className="font-bold text-slate-800 dark:text-white mb-2">Recompensas Disponíveis</h2>
                    {catalog.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                            <p className="text-slate-500">A loja está vazia no momento.</p>
                        </div>
                    )}
                    <div className="grid gap-4">
                        {catalog.map(item => {
                            const canAfford = balance >= item.cost;
                            const isOutOfStock = item.stock !== null && item.stock <= 0;
                            const isLoading = loadingIds.includes(item.id);

                            return (
                                <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                                    <div className="h-32 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 flex items-center justify-center text-5xl relative">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : '🎁'}
                                        {isOutOfStock && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                                <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold text-xs transform -rotate-12">ESGOTADO</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{item.title}</h3>
                                            <span className="bg-amber-100 text-amber-800 font-black text-xs px-2 py-1 rounded-full flex items-center shadow-sm shrink-0 ml-2">
                                                🪙 {item.cost}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex-1">{item.description}</p>

                                        <Button
                                            onClick={() => handleRedeem(item)}
                                            disabled={!canAfford || isOutOfStock || isLoading}
                                            className={`w-full font-bold shadow-sm ${!canAfford
                                                ? 'bg-slate-100 text-slate-400'
                                                : isOutOfStock
                                                    ? 'bg-red-50 text-red-400'
                                                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                                                }`}
                                        >
                                            {isLoading ? 'Resgatando...' : isOutOfStock ? 'Esgotado' : !canAfford ? `Falta ${item.cost - balance} 🪙` : 'Resgatar Recompensa'}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {activeTab === 'MISSOES' && (
                <div className="space-y-4">
                    <div className="mb-4">
                        <h2 className="font-bold text-slate-800 dark:text-white">Tarefas Valendo Moedas</h2>
                        <p className="text-xs text-slate-500 mt-1">Cumpra as missões cadastradas pelo RH, envie o comprovante e ganhe moedas extras na sua conta!</p>
                    </div>

                    {missions.length === 0 && (
                        <div className="text-center py-10 bg-white rounded-xl border border-slate-200">
                            <p className="text-slate-500">Nenhuma missão ativa no momento. Fique de olho!</p>
                        </div>
                    )}

                    <div className="grid gap-4">
                        {missions.map(mission => (
                            <div key={mission.id} className="bg-white dark:bg-slate-800 rounded-xl border-2 border-amber-200 dark:border-amber-800/50 shadow-sm p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight pr-2 flex items-center gap-2">
                                        <span className="text-xl">🎯</span> {mission.title}
                                    </h3>
                                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 font-black text-xs px-2 py-1 rounded-full flex items-center shadow-sm shrink-0 outline outline-1 outline-amber-200">
                                        + {mission.rewardAmount} 🪙
                                    </span>
                                </div>
                                {mission.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed">
                                        {mission.description}
                                    </p>
                                )}

                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 space-y-3">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">Como você cumpriu?</label>
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <Input
                                            value={proofTexts[mission.id] || ''}
                                            onChange={(e) => setProofTexts(prev => ({ ...prev, [mission.id]: e.target.value }))}
                                            placeholder="Descreva ou cole o link/texto do comprovante..."
                                            className="flex-1 text-sm bg-slate-50"
                                        />
                                        <Button
                                            onClick={() => handleSubmitMission(mission.id)}
                                            disabled={submittingMission === mission.id || !proofTexts[mission.id]?.trim()}
                                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold"
                                        >
                                            {submittingMission === mission.id ? 'Enviando...' : 'Enviar para o RH'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'HISTORICO' && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                        <h3 className="font-bold text-sm text-slate-800 dark:text-white">Extrato de Moedas</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {transactions.length === 0 && (
                            <div className="p-8 text-center text-slate-500 text-sm">
                                Nenhuma transação encontrada.
                            </div>
                        )}
                        {transactions.map(t => (
                            <div key={t.id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${t.amount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                                        {t.amount > 0 ? '+' : '-'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{t.description}</p>
                                        <p className="text-[10px] text-slate-500">{format(new Date(t.createdAt), 'dd/MM/yyyy • HH:mm')}</p>
                                    </div>
                                </div>
                                <div className={`font-black tracking-tight ${t.amount > 0 ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                                    {Math.abs(t.amount)} 🪙
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
