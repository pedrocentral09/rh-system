'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { getCompanyProfile, updateCompanyProfile, CompanyProfile } from '../actions/settings';
import { CNPJInput } from '@/shared/components/ui/cnpj-input';
import { toast } from 'sonner';
import { getAddressByCep } from '@/lib/via-cep';
import { Loader2 } from 'lucide-react';
import { maskCep } from '@/lib/utils';

import { motion } from 'framer-motion';

export function CompanyProfileForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isCepLoading, setIsCepLoading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState<CompanyProfile>({
        companyName: '',
        tradingName: '',
        cnpj: '',
        stateRegistration: '',
        municipalRegistration: '',
        email: '',
        phone: '',
        responsible: '',
        address: {
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: ''
        },
        closingDay: 20 // Default closing day for Time Tracking
    });

    const loadData = async () => {
        setLoading(true);
        const result = await getCompanyProfile();
        if (result.success && result.data) {
            // Merge with default structure to avoid nulls
            setFormData(prev => ({
                ...prev,
                ...result.data,
                address: { ...prev.address, ...result.data?.address }
            }));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const checkCep = async (cep: string) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length === 8) {
            if (!isCepLoading) {
                setIsCepLoading(true);
                const address = await getAddressByCep(cleanCep);

                if (address) {
                    setFormData(prev => ({
                        ...prev,
                        address: {
                            ...prev.address,
                            street: address.logradouro || '',
                            neighborhood: address.bairro || '',
                            city: address.localidade || '',
                            state: address.uf || '',
                            complement: address.complemento || prev.address.complement
                        }
                    }));
                    toast.success("Endereço encontrado!");
                }
                setIsCepLoading(false);
            }
        }
    };

    const handleAddressChange = (field: string, value: any) => {
        let finalValue = value;
        if (field === 'zipCode') {
            finalValue = maskCep(value);

            // Trigger check if we have a full CEP
            if (finalValue.replace(/\D/g, '').length === 8) {
                checkCep(finalValue);
            }
        }
        setFormData(prev => ({
            ...prev,
            address: { ...prev.address, [field]: finalValue }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const result = await updateCompanyProfile(formData);
        if (result.success) {
            toast.success('Dados da empresa atualizados com sucesso!');
        } else {
            toast.error('Erro ao salvar dados.');
        }
        setSaving(false);
    };

    if (loading) return (
        <div className="space-y-6">
            <div className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />
            <div className="h-64 bg-white/5 rounded-[2.5rem] animate-pulse" />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-700">
            {/* Secção: Identidade Jurídica */}
            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative space-y-10">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Identidade <span className="text-brand-orange">Jurídica</span></h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configuração de Cadastro Nacional e Registro Estadual</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Razão Social</label>
                            <Input
                                value={formData.companyName}
                                onChange={e => handleChange('companyName', e.target.value)}
                                placeholder="Nome Empresarial Ltda"
                                required
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-brand-orange/30 transition-all px-6"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Nome Fantasia</label>
                            <Input
                                value={formData.tradingName}
                                onChange={e => handleChange('tradingName', e.target.value)}
                                placeholder="Marca Comercial"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-brand-orange/30 transition-all px-6"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">CNPJ</label>
                            <Input
                                value={formData.cnpj}
                                onChange={e => handleChange('cnpj', e.target.value)}
                                placeholder="00.000.000/0000-00"
                                required
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-brand-orange/30 transition-all px-6 font-mono"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Inscrição Estadual</label>
                            <Input
                                value={formData.stateRegistration}
                                onChange={e => handleChange('stateRegistration', e.target.value)}
                                placeholder="Registro Estadual"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-brand-orange/30 transition-all px-6"
                            />
                        </div>
                        <div className="space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Inscrição Municipal</label>
                            <Input
                                value={formData.municipalRegistration}
                                onChange={e => handleChange('municipalRegistration', e.target.value)}
                                placeholder="Registro da Prefeitura"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-brand-orange/30 transition-all px-6"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Secção: Comunicação & Gestão */}
            <div className="bg-[#0A0F1C]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <div className="relative space-y-10">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Comunicação & <span className="text-indigo-400">Gestão</span></h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Dados de Contato e Regras de Fechamento de Ciclo</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                        <div className="md:col-span-6 space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Responsável Legal</label>
                            <Input
                                value={formData.responsible}
                                onChange={e => handleChange('responsible', e.target.value)}
                                placeholder="Nome Completo do Representante"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-indigo-500/30 transition-all px-6"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Email Corporativo</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="comercial@empresa.com"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-indigo-500/30 transition-all px-6"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-2 group">
                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Telefone Principal</label>
                            <Input
                                value={formData.phone}
                                onChange={e => handleChange('phone', e.target.value)}
                                placeholder="(00) 00000-0000"
                                className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-indigo-500/30 transition-all px-6"
                            />
                        </div>

                        <div className="md:col-span-6 flex items-start gap-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center text-xl">
                                📅
                            </div>
                            <div className="flex-1 space-y-2">
                                <label className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Dia de Fechamento do Ponto</label>
                                <Input
                                    type="number"
                                    min={1} max={31}
                                    value={formData.closingDay}
                                    onChange={e => handleChange('closingDay', parseInt(e.target.value))}
                                    className="bg-[#0A0F1C] border-white/10 rounded-xl h-10 w-24 text-center font-black text-white focus:border-emerald-500/30"
                                />
                                <p className="text-[9px] font-bold text-slate-600 uppercase leading-relaxed mt-2 italic">Atenção: Este dia define o corte mensal para cálculo de espelhos e folhas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Secção: Localização */}
            <div className="bg-[#0A0F1C]/20 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="relative space-y-10">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Sede & <span className="text-slate-400">Localização</span></h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Endereço Principal de Correspondência Legal</p>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">CEP</label>
                                <div className="relative">
                                    <Input
                                        value={formData.address.zipCode}
                                        onChange={e => handleAddressChange('zipCode', e.target.value)}
                                        maxLength={9}
                                        className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 transition-all px-6 font-mono"
                                    />
                                    {isCepLoading && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="h-5 w-5 animate-spin text-white/40" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-3 space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Rua / Logradouro</label>
                                <Input
                                    value={formData.address.street}
                                    onChange={e => handleAddressChange('street', e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 transition-all px-6"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Número</label>
                                <Input
                                    value={formData.address.number}
                                    onChange={e => handleAddressChange('number', e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 px-6"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Complemento</label>
                                <Input
                                    value={formData.address.complement}
                                    onChange={e => handleAddressChange('complement', e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 px-6"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Bairro</label>
                                <Input
                                    value={formData.address.neighborhood}
                                    onChange={e => handleAddressChange('neighborhood', e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 px-6"
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Cidade / UF</label>
                                <Input
                                    value={formData.address.city}
                                    onChange={e => handleAddressChange('city', e.target.value)}
                                    className="bg-white/5 border-white/10 rounded-2xl h-14 text-sm font-bold text-white focus:border-white/30 px-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button
                    type="submit"
                    disabled={saving}
                    className="h-16 px-12 rounded-[2rem] bg-brand-blue text-white text-[13px] font-black uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <span className="text-xl">💾</span>}
                    {saving ? 'PROCESSANDO...' : 'SALVAR ALTERAÇÕES'}
                </button>
            </div>
        </form>
    );
}
