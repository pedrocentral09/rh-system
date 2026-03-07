'use client';

import { useState } from 'react';
import { requestRedemption, submitMissionCompletion } from '@/modules/rewards/actions/coins';
import { sendCoinsToColleague } from '@/modules/rewards/actions/p2p';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
    Gift, Target, History, Heart, Send, Search, Sparkles,
    TrendingUp, TrendingDown, Clock
} from 'lucide-react';

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
    type: 'SPENT' | 'EARNED' | 'P2P_SENT' | 'P2P_RECEIVED';
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

interface Colleague {
    id: string;
    name: string;
    photoUrl: string | null;
    jobRole: { name: string } | null;
}

interface Props {
    balance: number;
    transactions: Transaction[];
    catalog: Reward[];
    missions: Mission[];
    colleagues: Colleague[];
}

export function EmployeeRewardsPortal({ balance: initialBalance, transactions: initialTransactions, catalog, missions, colleagues }: Props) {
    const [balance, setBalance] = useState(initialBalance);
    const [transactions, setTransactions] = useState(initialTransactions);
    const [activeTab, setActiveTab] = useState<'LOJA' | 'MISSOES' | 'HISTORICO' | 'RECONHECIMENTO'>('LOJA');
    const [loadingIds, setLoadingIds] = useState<string[]>([]);

    // P2P states
    const [p2pSearch, setP2pSearch] = useState('');
    const [selectedColleague, setSelectedColleague] = useState<Colleague | null>(null);
    const [p2pAmount, setP2pAmount] = useState('5');
    const [p2pMessage, setP2pMessage] = useState('');
    const [sendingP2P, setSendingP2P] = useState(false);

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

    const handleSendP2P = async () => {
        if (!selectedColleague) return;
        const amount = parseInt(p2pAmount);
        if (isNaN(amount) || amount <= 0) {
            toast.error('Informe um valor válido');
            return;
        }
        if (amount > balance) {
            toast.error('Saldo insuficiente');
            return;
        }
        if (!p2pMessage.trim()) {
            toast.error('Escreva uma mensagem de reconhecimento');
            return;
        }

        setSendingP2P(true);
        const result = await sendCoinsToColleague(selectedColleague.id, amount, p2pMessage);

        if (result.success) {
            toast.success('Reconhecimento enviado! ✨');
            setBalance(prev => prev - amount);
            setTransactions(prev => [{
                id: Math.random().toString(),
                amount: -amount,
                type: 'P2P_SENT',
                description: `Reco. enviado para ${selectedColleague.name}`,
                createdAt: new Date()
            }, ...prev]);
            setSelectedColleague(null);
            setP2pMessage('');
            setActiveTab('HISTORICO');
        } else {
            toast.error(result.error || 'Erro ao enviar moedas');
        }
        setSendingP2P(false);
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
            toast.success('Comprovante enviado! O RH fará a análise em breve.');
            setProofTexts(prev => ({ ...prev, [missionId]: '' }));
        } else {
            toast.error(result.error || 'Erro ao enviar a missão');
        }
        setSubmittingMission(null);
    };

    const filteredColleagues = colleagues.filter(c =>
        c.name.toLowerCase().includes(p2pSearch.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Balance Card */}
            <div className="bg-slate-950 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-[120px] -mr-20 -mt-20 group-hover:bg-orange-500/30 transition-all duration-700"></div>
                <div className="relative z-10 flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2 mb-6 bg-white/5 px-5 py-2 rounded-full border border-white/10 backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-orange-100">Portal de Recompensas Elite</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="h-24 w-24 bg-gradient-to-br from-amber-300 to-orange-600 rounded-3xl flex items-center justify-center shadow-[0_0_60px_-10px_rgba(249,115,22,0.6)] rotate-6 group-hover:rotate-12 transition-transform duration-500">
                            <span className="text-5xl">🪙</span>
                        </div>
                        <span className="text-8xl font-black tracking-tighter drop-shadow-2xl">{balance}</span>
                    </div>
                    <div className="mt-8 flex flex-col items-center">
                        <span className="text-sm text-slate-400 font-bold uppercase tracking-widest">Saldo Disponível em Carteira</span>
                        <div className="mt-3 h-1.5 w-48 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-[75%] shadow-[0_0_15px_#f97316]"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/5 p-2 rounded-[24px] overflow-x-auto no-scrollbar">
                {[
                    { id: 'LOJA', label: 'Lojinha', icon: Gift },
                    { id: 'RECONHECIMENTO', label: 'Reconhecer', icon: Heart },
                    { id: 'MISSOES', label: 'Missões', icon: Target },
                    { id: 'HISTORICO', label: 'Extrato', icon: History }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[130px] py-4 text-xs font-black uppercase tracking-widest rounded-[18px] flex items-center justify-center gap-2.5 transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-xl scale-[1.02]' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <tab.icon className={`h-4 w-4 ${activeTab === 'RECONHECIMENTO' && tab.id === 'RECONHECIMENTO' ? 'fill-rose-500 text-rose-500' : ''}`} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'LOJA' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                            Vitrine de Recompensas
                            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
                        </h2>
                    </div>
                    {catalog.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/5">
                            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Repondo o estoque...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {catalog.map(item => (
                                <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 overflow-hidden flex flex-col">
                                    <div className="aspect-[5/4] bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-white/5 relative">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-7xl opacity-20 group-hover:scale-125 transition-transform duration-700">🎁</div>
                                        )}
                                        <div className="absolute top-6 right-6 bg-slate-950/80 backdrop-blur-xl border border-white/10 text-white font-black text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2">
                                            <span className="text-orange-400">🪙</span> {item.cost}
                                        </div>
                                    </div>
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-3 leading-tight uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 flex-1 line-clamp-3 font-medium leading-relaxed">{item.description}</p>
                                        <Button
                                            onClick={() => handleRedeem(item)}
                                            disabled={balance < item.cost || (item.stock !== null && item.stock <= 0) || loadingIds.includes(item.id)}
                                            className="w-full rounded-2xl h-14 font-black uppercase text-xs tracking-[0.2em] shadow-xl disabled:opacity-50 bg-slate-900 hover:bg-orange-500 text-white transition-all group/btn"
                                        >
                                            {loadingIds.includes(item.id) ? 'Sincronizando...' : balance >= item.cost ? 'Resgatar Agora' : `Falta ${item.cost - balance} Moedas`}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'RECONHECIMENTO' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/5 p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-20 -left-20 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                            <div className="flex-1 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-1 bg-rose-500 rounded-full"></div>
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">1. Encontrar o Colega</label>
                                    </div>
                                    <div className="relative">
                                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                        <Input
                                            value={p2pSearch}
                                            onChange={(e) => setP2pSearch(e.target.value)}
                                            placeholder="Buscar pelo nome ou cargo..."
                                            className="pl-14 h-16 rounded-3xl bg-slate-50 dark:bg-slate-950 border-none font-bold text-lg focus:ring-2 focus:ring-rose-500 transition-all shadow-inner"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-3 custom-scrollbar">
                                        {filteredColleagues.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => setSelectedColleague(c)}
                                                className={`p-4 rounded-3xl flex items-center gap-4 transition-all text-left group ${selectedColleague?.id === c.id ? 'bg-rose-500 text-white shadow-xl translate-x-1' : 'bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                                            >
                                                <div className={`h-12 w-12 rounded-2xl overflow-hidden flex items-center justify-center font-black uppercase text-sm border-2 ${selectedColleague?.id === c.id ? 'border-white/20' : 'border-slate-200 dark:border-white/10'}`}>
                                                    {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" /> : c.name.substring(0, 2)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-base truncate tracking-tight">{c.name}</p>
                                                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedColleague?.id === c.id ? 'text-rose-100' : 'text-slate-400'}`}>{c.jobRole?.name || 'Membro da Família'}</p>
                                                </div>
                                                {selectedColleague?.id === c.id && <Sparkles className="h-5 w-5 text-rose-200" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="w-px bg-slate-100 dark:bg-white/5 hidden lg:block self-stretch"></div>

                            <div className="flex-1 space-y-8">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-1 bg-rose-500 rounded-full"></div>
                                        <label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">2. Enviar Encorajamento</label>
                                    </div>
                                    <div className="grid grid-cols-4 gap-3">
                                        {['5', '10', '25', '50'].map(val => (
                                            <button
                                                key={val}
                                                onClick={() => setP2pAmount(val)}
                                                className={`h-14 rounded-2xl font-black text-sm transition-all border-2 ${p2pAmount === val ? 'bg-slate-950 text-white border-slate-950 dark:bg-white dark:text-slate-950 dark:border-white shadow-xl' : 'bg-transparent border-slate-100 dark:border-white/5 text-slate-400 hover:border-rose-500/30 hover:text-rose-500'}`}
                                            >
                                                {val}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={p2pMessage}
                                            onChange={(e) => setP2pMessage(e.target.value)}
                                            placeholder="Por que você está reconhecendo este colega? Escreva algo marcante..."
                                            className="w-full min-h-[160px] p-6 rounded-[32px] bg-slate-50 dark:bg-slate-950 border-none font-bold text-sm resize-none focus:ring-2 focus:ring-rose-500 transition-all outline-none shadow-inner leading-relaxed"
                                        />
                                        <div className="absolute bottom-4 right-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">Inspiracional</div>
                                    </div>
                                    <Button
                                        onClick={handleSendP2P}
                                        disabled={!selectedColleague || sendingP2P || balance < parseInt(p2pAmount)}
                                        className="w-full h-16 rounded-[24px] bg-rose-500 hover:bg-rose-600 text-white font-black uppercase text-xs tracking-[0.4em] shadow-[0_15px_40px_-5px_rgba(244,63,94,0.4)] group active:scale-95 transition-all"
                                    >
                                        {sendingP2P ? 'Processando Reconhecimento...' : (
                                            <>
                                                Reconhecer Colega
                                                <Send className="ml-3 h-4 w-4 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                            </>
                                        )}
                                    </Button>
                                    {balance < parseInt(p2pAmount) && (
                                        <div className="text-center p-3 bg-rose-50 dark:bg-rose-500/10 rounded-2xl">
                                            <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center justify-center gap-2">
                                                Saldo insuficiente para enviar {p2pAmount} moedas
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'MISSOES' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center gap-3">
                            Missões Disponíveis
                            <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                            </div>
                        </h2>
                    </div>
                    {missions.length === 0 ? (
                        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-200 dark:border-white/5">
                            <p className="text-slate-500 font-black uppercase text-xs tracking-[0.2em]">Sem missões ativas hoje.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {missions.map(mission => (
                                <div key={mission.id} className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/5 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                                    <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8">
                                        <div className="h-24 w-24 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-6 transition-transform duration-500 group-hover:shadow-indigo-500/50">
                                            🎯
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h3 className="font-black text-xl text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{mission.title}</h3>
                                                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-xs px-5 py-2 rounded-full uppercase tracking-[0.1em] border border-emerald-500/20">
                                                    + {mission.rewardAmount} 🪙
                                                </span>
                                            </div>
                                            <p className="text-base text-slate-500 dark:text-slate-400 max-w-2xl font-medium leading-relaxed">{mission.description}</p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-4 min-w-[320px]">
                                            <Input
                                                value={proofTexts[mission.id] || ''}
                                                onChange={(e) => setProofTexts(prev => ({ ...prev, [mission.id]: e.target.value }))}
                                                placeholder="Descreva a conclusão..."
                                                className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-none font-bold text-sm shadow-inner"
                                            />
                                            <Button
                                                onClick={() => handleSubmitMission(mission.id)}
                                                disabled={submittingMission === mission.id || !proofTexts[mission.id]?.trim()}
                                                className="bg-indigo-600 hover:bg-slate-950 dark:hover:bg-white dark:hover:text-black text-white rounded-2xl h-14 font-black uppercase text-xs tracking-widest px-10 shadow-xl transition-all"
                                            >
                                                {submittingMission === mission.id ? '...' : 'Enviar'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'HISTORICO' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
                            <div className="flex items-center gap-4">
                                <History className="h-5 w-5 text-orange-500" />
                                <h3 className="font-black text-sm uppercase tracking-[0.4em] text-slate-900 dark:text-white">Extrato Consolidado</h3>
                            </div>
                            <Clock className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {transactions.length === 0 ? (
                                <div className="p-24 text-center text-slate-400 font-bold uppercase text-xs tracking-[0.3em]">Nenhuma atividade encontrada</div>
                            ) : (
                                transactions.map(t => (
                                    <div key={t.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all group cursor-default">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-xl shadow-xl transition-all group-hover:scale-110 group-hover:rotate-3 ${t.amount > 0
                                                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                                    : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400'
                                                }`}>
                                                {t.amount > 0 ? <TrendingUp className="h-7 w-7" /> : <TrendingDown className="h-7 w-7" />}
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-base font-black text-slate-900 dark:text-white truncate max-w-md tracking-tight">{t.description}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                    {format(new Date(t.createdAt), 'dd MMMM yyyy')}
                                                    <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                                    {format(new Date(t.createdAt), 'HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`text-2xl font-black tracking-tighter ${t.amount > 0 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'} group-hover:scale-110 transition-transform`}>
                                            {t.amount > 0 ? '+' : ''}{t.amount} 🪙
                                        </div>
                                    </div>
                                )).reverse()
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
