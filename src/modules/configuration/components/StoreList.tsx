'use client';

import { maskCep } from '@/lib/utils';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { getStores, createStore, updateStore, deleteStore } from '../actions/stores';
import { toast } from 'sonner';
import { getAddressByCep } from '@/lib/via-cep';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Gestão de <span className="text-brand-orange">Unidades</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Configuração de Lojas e Pontos Físicos</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="h-12 px-8 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange/90 transition-all shadow-[0_0_20px_rgba(255,102,0,0.2)] flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg group-hover:rotate-90 transition-transform duration-300">+</span>
                    Nova Unidade
                </button>
            </div>

            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="space-y-4">
                    <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        <div className="col-span-12 md:col-span-5 text-left">Nome da Unidade / Razão Social</div>
                        <div className="hidden md:block md:col-span-3 text-left">Localização</div>
                        <div className="hidden md:block md:col-span-2 text-center">Colaboradores</div>
                        <div className="hidden md:block md:col-span-2 text-right">Ações</div>
                    </div>

                    <div className="space-y-3">
                        {stores.map((store, i) => (
                            <motion.div
                                key={store.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-12 items-center px-8 py-6 bg-[#0A0F1C] border border-white/5 rounded-[1.5rem] hover:border-brand-orange/30 hover:scale-[1.01] hover:bg-white/[0.02] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="col-span-12 md:col-span-5 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-brand-orange/30 transition-colors">
                                        🏪
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-white uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">{store.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{store.cnpj || 'Documento Pendente'}</p>
                                            {store.erpId && (
                                                <span className="text-[8px] font-black text-brand-orange/80 uppercase tracking-widest bg-brand-orange/10 px-1.5 py-0.5 rounded border border-brand-orange/20">
                                                    ID {store.erpId}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block md:col-span-3">
                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-tighter">{store.city || 'Cidade não inf.'}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{store.state || 'UF'}</p>
                                </div>

                                <div className="hidden md:block md:col-span-2 text-center">
                                    <div className="inline-flex flex-col items-center bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                                        <span className="text-sm font-black text-white">{store._count?.contracts || 0}</span>
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Ativos</span>
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-2 flex justify-end gap-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => openModal(store)}
                                        className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(store.id)}
                                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {stores.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/5 rounded-[2rem] border border-white/5 border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma unidade localizada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStore ? "Editar Unidade" : "Nova Unidade"} width="2xl">
                <form onSubmit={handleSubmit} className="space-y-8 py-6 max-h-[75vh] overflow-y-auto px-4 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Identificação Estratégica</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within:text-brand-orange transition-colors">Razão Social</label>
                                <Input
                                    className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white focus:border-brand-orange/30 transition-all"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within:text-brand-orange transition-colors">Nome Fantasia</label>
                                <Input
                                    className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white focus:border-brand-orange/30 transition-all"
                                    value={formData.tradingName}
                                    onChange={e => handleChange('tradingName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1 group-focus-within:text-brand-orange transition-colors">CNPJ</label>
                                <Input
                                    className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white focus:border-brand-orange/30 transition-all"
                                    value={formData.cnpj}
                                    onChange={e => handleChange('cnpj', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-brand-orange uppercase tracking-widest ml-1">ID ERP (Sincronização)</label>
                                <Input
                                    className="bg-brand-orange/5 border-brand-orange/20 rounded-2xl h-12 text-sm font-black text-white focus:border-brand-orange/40 transition-all"
                                    value={formData.erpId}
                                    onChange={e => handleChange('erpId', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="text-center pt-6">
                            <h4 className="inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border-b border-white/5 pb-2 mb-8">Logística & localização</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">CEP</label>
                                <div className="relative">
                                    <Input
                                        className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white pr-10"
                                        value={formData.zipCode}
                                        onChange={e => handleChange('zipCode', e.target.value)}
                                        maxLength={9}
                                    />
                                    {isCepLoading && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-brand-orange" />}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Logradouro</label>
                                <Input className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white" value={formData.street} onChange={e => handleChange('street', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Número</label>
                                <Input className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white" value={formData.number} onChange={e => handleChange('number', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Bairro</label>
                                <Input className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white" value={formData.neighborhood} onChange={e => handleChange('neighborhood', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Cidade - UF</label>
                                <div className="flex gap-2">
                                    <Input className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white flex-1" value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                                    <Input className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white w-16 text-center uppercase" value={formData.state} onChange={e => handleChange('state', e.target.value)} maxLength={2} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-10 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : 'Salvar Unidade'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
