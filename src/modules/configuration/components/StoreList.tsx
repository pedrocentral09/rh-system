'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { getStores, createStore, deleteStore } from '../actions/stores';
import { toast } from 'sonner';

export function StoreList() {
    const [stores, setStores] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', code: '', city: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => { load() }, []);

    async function load() {
        const res = await getStores();
        if (res.success) setStores(res.data || []);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        const res = await createStore(formData);
        if (res.success) {
            toast.success('Loja adicionada!');
            setIsModalOpen(false);
            setFormData({ name: '', code: '', city: '' });
            load();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Excluir loja?')) return;
        const res = await deleteStore(id);
        if (res.success) {
            toast.success('Excluída!');
            load();
        } else {
            toast.error(res.error);
        }
    }

    return (
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="text-slate-900 dark:text-white">Lojas (Unidades)</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Locais físicos de trabalho.</CardDescription>
                </div>
                <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white">
                    + Nova Loja
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {stores.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{store.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{store.city || 'S/ Cidade'} • {store._count?.contracts || 0} locados</div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 h-8" onClick={() => handleDelete(store.id)}>
                                🗑️
                            </Button>
                        </div>
                    ))}
                    {stores.length === 0 && <div className="text-center text-slate-400 py-4">Nenhuma loja cadastrada.</div>}
                </div>
            </CardContent>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Loja">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium">Nome da Loja</label>
                        <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="Loja Centro" />
                    </div>
                    <div>
                        <label className="text-sm font-medium">Cidade</label>
                        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="São Paulo" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
