'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { getCompanies, createCompany, updateCompany, deleteCompany } from '../actions/companies';
import { toast } from 'sonner';
import { getAddressByCep } from '@/lib/via-cep';
import { Loader2 } from 'lucide-react';
import { maskCep } from '@/lib/utils';

import { motion } from 'framer-motion';

export function CompanyList() {
    const [companies, setCompanies] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCompany, setEditingCompany] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    const initialForm = {
        name: '',
        tradingName: '',
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
        zipCode: ''
    };

    const [formData, setFormData] = useState(initialForm);

    useEffect(() => { load() }, []);

    async function load() {
        const res = await getCompanies();
        if (res.success) setCompanies(res.data || []);
    }

    const openModal = (company?: any) => {
        if (company) {
            setEditingCompany(company.id);
            setFormData({
                ...initialForm,
                ...company
            });
        } else {
            setEditingCompany(null);
            setFormData(initialForm);
        }
        setIsModalOpen(true);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = editingCompany
            ? await updateCompany(editingCompany, formData)
            : await createCompany(formData);

        if (res.success) {
            toast.success(editingCompany ? 'Empresa atualizada!' : 'Empresa adicionada!');
            setIsModalOpen(false);
            load();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Excluir empresa?')) return;
        const res = await deleteCompany(id);
        if (res.success) {
            toast.success('Excluída!');
            load();
        } else {
            toast.error(res.error);
        }
    }

    const checkCep = async (cep: string) => {
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

    const handleChange = (field: string, value: string) => {
        let finalValue = value;
        if (field === 'zipCode') {
            finalValue = maskCep(value);

            // Trigger check if we have a full CEP
            if (finalValue.replace(/\D/g, '').length === 8) {
                checkCep(finalValue);
            }
        }
        setFormData(prev => ({ ...prev, [field]: finalValue }));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Entidades <span className="text-brand-orange">Legais</span></h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-widest mt-1">Gestão de Empresas e Registros Centrais</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="h-12 px-8 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange/90 transition-all shadow-[0_0_20px_rgba(255,102,0,0.2)] flex items-center justify-center gap-2 group"
                >
                    <span className="text-lg group-hover:rotate-90 transition-transform duration-300">+</span>
                    Nova Empresa
                </button>
            </div>

            <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="space-y-4">
                    <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                        <div className="col-span-12 md:col-span-6 text-left">Razão Social / Dados Fiscais</div>
                        <div className="hidden md:block md:col-span-4 text-center">Estatísticas de Contrato</div>
                        <div className="hidden md:block md:col-span-2 text-right">Controle</div>
                    </div>

                    <div className="space-y-3">
                        {companies.map((comp, i) => (
                            <motion.div
                                key={comp.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="grid grid-cols-12 items-center px-8 py-6 bg-surface border border-border rounded-[1.5rem] hover:border-brand-orange/30 hover:scale-[1.01] hover:bg-text-primary/[0.02] transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="col-span-12 md:col-span-6 flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-text-primary/5 border border-border flex items-center justify-center text-xl shadow-inner group-hover:border-brand-orange/30 transition-colors">
                                        🏢
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">{comp.name}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">CNPJ: {comp.cnpj || 'PENDENTE'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="hidden md:block md:col-span-4 text-center">
                                    <div className="inline-flex items-center gap-4 bg-text-primary/5 px-6 py-2 rounded-2xl border border-border">
                                        <div className="flex flex-col items-center">
                                            <span className="text-sm font-black text-indigo-400">{comp._count?.contracts || 0}</span>
                                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Matrículas</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-12 md:col-span-2 flex justify-end gap-2 mt-4 md:mt-0">
                                    <button
                                        onClick={() => openModal(comp)}
                                        className="h-9 px-4 rounded-xl bg-text-primary/5 border border-border text-[9px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all shadow-lg flex items-center gap-2"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(comp.id)}
                                        className="w-9 h-9 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </motion.div>
                        ))}

                        {companies.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-text-muted/40 bg-text-primary/2 rounded-[2rem] border border-border border-dashed">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma empresa cadastrada</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCompany ? "Editar Empresa" : "Nova Empresa"} width="2xl">
                <form onSubmit={handleSubmit} className="space-y-8 py-6 max-h-[75vh] overflow-y-auto px-4 custom-scrollbar">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Dados Corporativos & Fiscais</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 group-focus-within:text-brand-orange transition-colors">Razão Social</label>
                                <Input
                                    className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary focus:border-brand-orange/30 transition-all font-mono"
                                    value={formData.name}
                                    onChange={e => handleChange('name', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1 group-focus-within:text-brand-orange transition-colors">Nome Fantasia</label>
                                <Input
                                    className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary focus:border-brand-orange/30 transition-all"
                                    value={formData.tradingName}
                                    onChange={e => handleChange('tradingName', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2 group uppercase">
                                <label className="text-[9px] font-black text-brand-orange uppercase tracking-widest ml-1">CNPJ Matriz</label>
                                <Input
                                    className="bg-brand-orange/5 border-brand-orange/20 rounded-2xl h-12 text-sm font-black text-text-primary focus:border-brand-orange/40 transition-all"
                                    value={formData.cnpj}
                                    onChange={e => handleChange('cnpj', e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Responsável Legal</label>
                                <Input
                                    className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary transition-all"
                                    value={formData.responsible}
                                    onChange={e => handleChange('responsible', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Inscrição Estadual</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.stateRegistration} onChange={e => handleChange('stateRegistration', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Inscrição Municipal</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.municipalRegistration} onChange={e => handleChange('municipalRegistration', e.target.value)} />
                            </div>
                        </div>

                        <div className="text-center pt-6">
                            <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Informações de Contato</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Email Corporativo</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.email} onChange={e => handleChange('email', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Telefone Fixo / Celular</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
                            </div>
                        </div>

                        <div className="text-center pt-6">
                            <h4 className="inline-block text-[10px] font-black text-text-muted uppercase tracking-[0.3em] border-b border-border pb-2 mb-8">Sede Administrativa</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">CEP</label>
                                <div className="relative">
                                    <Input
                                        className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary pr-10"
                                        value={formData.zipCode}
                                        onChange={e => handleChange('zipCode', e.target.value)}
                                        maxLength={9}
                                    />
                                    {isCepLoading && <Loader2 className="absolute right-4 top-4 h-4 w-4 animate-spin text-brand-orange" />}
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Logradouro</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.street} onChange={e => handleChange('street', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Número</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.number} onChange={e => handleChange('number', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Bairro</label>
                                <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary" value={formData.neighborhood} onChange={e => handleChange('neighborhood', e.target.value)} />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Cidade - UF</label>
                                <div className="flex gap-2">
                                    <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary flex-1" value={formData.city} onChange={e => handleChange('city', e.target.value)} />
                                    <Input className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary w-16 text-center uppercase" value={formData.state} onChange={e => handleChange('state', e.target.value)} maxLength={2} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-8 border-t border-border">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-12 px-10 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-xl disabled:opacity-50"
                        >
                            {loading ? 'Processando...' : 'Salvar Empresa'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
