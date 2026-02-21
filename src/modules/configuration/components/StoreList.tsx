'use client';

import { maskCep } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { getStores, createStore, updateStore, deleteStore } from '../actions/stores';
import { toast } from 'sonner';
import { getAddressByCep } from '@/lib/via-cep';
import { Loader2 } from 'lucide-react';

export function StoreList() {
    const [stores, setStores] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    const initialForm = {
        name: '',
        tradingName: '',
        code: '',
        cnpj: '',
        stateRegistration: '',
        municipalRegistration: '',
        phone: '',
        email: '',
        responsible: '',
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: '',
        erpId: ''
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { load() }, []);

    // Automatic CEP check
    useEffect(() => {
        const checkCep = async () => {
            const cep = formData.zipCode;
            if (!cep) return;

            const cleanCep = cep.replace(/\D/g, '');
            if (cleanCep.length === 8) {
                if (!isCepLoading) {
                    setIsCepLoading(true);
                    const address = await getAddressByCep(cleanCep);

                    if (address) {
                        setFormData(prev => ({
                            ...prev,
                            street: address.logradouro || '',
                            neighborhood: address.bairro || '',
                            city: address.localidade || '',
                            state: address.uf || '',
                            complement: address.complemento || prev.complement
                        }));
                        toast.success("Endereço encontrado!");
                    }
                    setIsCepLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            if (formData.zipCode && formData.zipCode.replace(/\D/g, '').length === 8) {
                checkCep();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.zipCode]);

    async function load() {
        const res = await getStores();
        if (res.success) setStores(res.data || []);
    }

    const openModal = (store?: any) => {
        if (store) {
            setEditingStore(store.id);

            // Garantir que todos os nulls do banco virem strings vazias para o React Input
            const safeStore = Object.keys(store).reduce((acc: any, key) => {
                acc[key] = store[key] === null ? '' : store[key];
                return acc;
            }, {});

            setFormData({
                ...initialForm,
                ...safeStore
            });
        } else {
            setEditingStore(null);
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = editingStore
            ? await updateStore(editingStore, formData)
            : await createStore(formData);

        if (res.success) {
            toast.success(editingStore ? 'Loja atualizada!' : 'Loja adicionada!');
            setIsModalOpen(false);
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

    const handleChange = (field: string, value: string) => {
        let finalValue = value;
        if (field === 'zipCode') {
            finalValue = maskCep(value);
        }
        setFormData(prev => ({ ...prev, [field]: finalValue }));
    };



    return (
        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardHeader className="flex flex-row justify-between items-center">
                <div>
                    <CardTitle className="text-slate-900 dark:text-white">Lojas (Unidades)</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Locais físicos de trabalho.</CardDescription>
                </div>
                <Button onClick={() => openModal()} size="sm" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white">
                    + Nova Loja
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {stores.map(store => (
                        <div key={store.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-700">
                            <div>
                                <div className="font-medium text-slate-800 dark:text-slate-200">{store.name}</div>
                                <div className="text-[13px] text-slate-600 dark:text-slate-400 mt-0.5">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">{store.city || 'S/ Cidade'}</span>
                                    <span className="mx-2 text-slate-300">|</span>
                                    {store.cnpj || 'S/ CNPJ'}
                                    {store.erpId && (
                                        <>
                                            <span className="mx-2 text-slate-300">|</span>
                                            <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 rounded uppercase text-[10px] font-bold">
                                                ERP ID: {store.erpId}
                                            </span>
                                        </>
                                    )}
                                    <span className="mx-2 text-slate-300">|</span>
                                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 rounded uppercase text-[10px] font-bold">
                                        {store._count?.contracts || 0} matriculados
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600" onClick={() => openModal(store)}>
                                    ✏️
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 h-8" onClick={() => handleDelete(store.id)}>
                                    🗑️
                                </Button>
                            </div>
                        </div>
                    ))}
                    {stores.length === 0 && <div className="text-center text-slate-400 py-4">Nenhuma loja cadastrada.</div>}
                </div>
            </CardContent>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStore ? "Editar Loja" : "Nova Loja"} width="lg">
                <form onSubmit={handleSubmit} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-4">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Identificação</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Razão Social</label>
                                    <Input value={formData.name} onChange={e => handleChange('name', e.target.value)} required placeholder="Ex: Loja Matriz Ltda" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome Fantasia</label>
                                    <Input value={formData.tradingName} onChange={e => handleChange('tradingName', e.target.value)} placeholder="Ex: Unidade Centro" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-orange-600 dark:text-orange-400">ID Empresa (ERP)</label>
                                <Input value={formData.erpId} onChange={e => handleChange('erpId', e.target.value)} placeholder="0, 6, 7..." className="border-orange-200 focus-visible:ring-orange-500" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">CNPJ Próprio (Opcional)</label>
                                <Input value={formData.cnpj} onChange={e => handleChange('cnpj', e.target.value)} placeholder="00.000.000/0001-00" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Código Interno</label>
                            <Input value={formData.code} onChange={e => handleChange('code', e.target.value)} placeholder="LJ01" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Inscrição Estadual</label>
                            <Input value={formData.stateRegistration} onChange={e => handleChange('stateRegistration', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Inscrição Municipal</label>
                            <Input value={formData.municipalRegistration} onChange={e => handleChange('municipalRegistration', e.target.value)} />
                        </div>

                        <div className="md:col-span-2 mt-4 space-y-4">
                            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">Contato e Endereço</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Telefone</label>
                                    <Input value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="(00) 0000-0000" />
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input value={formData.email} onChange={e => handleChange('email', e.target.value)} placeholder="loja@email.com" />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Responsável pela Unidade</label>
                            <Input value={formData.responsible} onChange={e => handleChange('responsible', e.target.value)} placeholder="Gerente / Encarregado" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">CEP</label>
                            <div className="relative">
                                <Input
                                    value={formData.zipCode}
                                    onChange={e => handleChange('zipCode', e.target.value)}
                                    placeholder="00000-000"
                                    maxLength={9}
                                    className="pr-10"
                                />
                                {isCepLoading && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium">Rua</label>
                            <Input value={formData.street} onChange={e => handleChange('street', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Número</label>
                            <Input value={formData.number} onChange={e => handleChange('number', e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bairro</label>
                            <Input value={formData.neighborhood} onChange={e => handleChange('neighborhood', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Cidade</label>
                            <Input value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">UF</label>
                            <Input value={formData.state} onChange={e => handleChange('state', e.target.value)} maxLength={2} placeholder="SP" />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700 mt-6">
                        <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="text-slate-600 dark:text-slate-400">Cancelar</Button>
                        <Button type="submit" disabled={loading} className="bg-brand-blue hover:bg-blue-800 text-white min-w-[120px] font-semibold">
                            {loading ? 'Salvando...' : 'Salvar Loja'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
