'use client';

import { useState } from 'react';
import { createRewardItem, toggleRewardStatus, deleteRewardItem } from '@/modules/rewards/actions/coins';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

interface Reward {
    id: string;
    title: string;
    description: string | null;
    cost: number;
    stock: number | null;
    isActive: boolean;
    imageUrl: string | null;
}

export function RewardCatalogManager({ initialCatalog }: { initialCatalog: Reward[] }) {
    const [catalog, setCatalog] = useState<Reward[]>(initialCatalog);
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [cost, setCost] = useState(100);
    const [stock, setStock] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const stockVal = stock ? parseInt(stock) : undefined;

        const result = await createRewardItem({
            title,
            description,
            cost,
            stock: stockVal
        });

        if (result.success && result.data) {
            toast.success('Item adicionado ao catálogo!');
            setCatalog([result.data as any, ...catalog]);
            setIsCreating(false);
            setTitle('');
            setDescription('');
            setCost(100);
            setStock('');
        } else {
            toast.error(result.error || 'Erro ao criar item');
        }
        setLoading(false);
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        const result = await toggleRewardStatus(id, !currentStatus);
        if (result.success) {
            setCatalog(catalog.map(c => c.id === id ? { ...c, isActive: !currentStatus } : c));
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este item do catálogo? Isso não afetará os históricos de quem já resgatou.')) return;
        const result = await deleteRewardItem(id);
        if (result.success) {
            toast.success('Item excluído.');
            setCatalog(catalog.filter(c => c.id !== id));
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Gerenciar Loja de Recompensas</h2>
                    <p className="text-xs text-slate-500">Cadastre prêmios que os colaboradores podem resgatar usando Família Coins.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>+ Novo Item</Button>
                )}
            </div>

            {isCreating && (
                <div className="bg-amber-50 dark:bg-slate-800 p-6 rounded-xl border border-amber-100 dark:border-slate-700">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="col-span-1 md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Título da Recompensa</label>
                                <Input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Squeeze Térmica Família" />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Custo (Moedas)</label>
                                <Input required type="number" min="1" value={cost} onChange={e => setCost(Number(e.target.value))} />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Estoque Físico</label>
                                <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} placeholder="Deixe vazio se infinito" />
                            </div>
                            <div className="col-span-1 md:col-span-4">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Descrição Breve</label>
                                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Garrafa térmica de 500ml com logo da empresa." />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Adicionar ao Catálogo'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {catalog.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-slate-300 rounded-xl">
                        <span className="text-4xl mb-2 block">🛍️</span>
                        <h4 className="text-lg font-bold text-slate-700">Lojinha Vazia</h4>
                        <p className="text-slate-500 text-sm mt-1">Nenhum item cadastrado no catálogo de recompensas.</p>
                    </div>
                )}
                {catalog.map(item => (
                    <div key={item.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${!item.isActive ? 'opacity-60 saturate-50' : 'border-amber-200'}`}>
                        <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 text-slate-300 text-5xl">
                            {item.imageUrl ? <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" /> : '🎁'}
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 text-lg leading-tight">{item.title}</h3>
                                <span className="bg-amber-100 text-amber-800 font-black text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
                                    <span className="mr-1">🪙</span>{item.cost}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">{item.description}</p>

                            <div className="flex justify-between items-center text-xs font-medium border-t border-slate-100 pt-3">
                                <span className={item.stock === 0 ? 'text-red-500 font-bold' : 'text-slate-500'}>
                                    Estoque: {item.stock === null ? 'Infinito (Digital/Tempo)' : item.stock}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Excluir">
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => handleToggle(item.id, item.isActive)}
                                        className={`px-2 py-1 rounded transition-colors ${item.isActive ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                                    >
                                        {item.isActive ? 'Ocultar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
