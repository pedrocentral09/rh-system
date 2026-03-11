'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Settings2,
    Percent,
    DollarSign,
    ShieldCheck,
    Save,
    RefreshCw,
    AlertCircle,
    Info
} from 'lucide-react';
import { getSystemParameters, updateSystemParameters, SystemParameters } from '../actions/settings';
import { toast } from 'sonner';

export function SystemParametersManager() {
    const [params, setParams] = useState<SystemParameters | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        getSystemParameters().then(res => {
            if (res.success && res.data) setParams(res.data);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!params) return;
        setSaving(true);
        const res = await updateSystemParameters(params);
        if (res.success) {
            toast.success('Parâmetros salvos com sucesso!');
        } else {
            toast.error(res.error || 'Erro ao salvar parâmetros');
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-6">
                <RefreshCw className="h-12 w-12 animate-spin text-brand-orange/40" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] animate-pulse">Carregando Parâmetros Legais...</p>
            </div>
        );
    }

    if (!params) return null;

    return (
        <div className="space-y-12 pb-20">
            <header className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-border pb-10">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-[2rem] bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shadow-2xl">
                        <Settings2 className="h-8 w-8 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Configurações de <span className="text-brand-orange">Cálculo</span></h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-brand-orange animate-pulse" />
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-brand-orange">Protocolo Legal & Encargos 2025</p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="h-14 px-10 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center gap-4 shadow-2xl shadow-brand-orange/20 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    SALVAR ALTERAÇÕES 🚀
                </button>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {/* SETOR 1: TAXAS E PERCENTUAIS */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <Percent className="h-4 w-4 text-brand-orange" />
                        <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Encargos Sociais e Trabalhistas</h4>
                    </div>

                    <div className="bg-surface-secondary/30 border border-border p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">INSS Patronal (%)</label>
                            <input
                                type="number"
                                value={params.rates.inssPatronal}
                                onChange={e => setParams({ ...params, rates: { ...params.rates, inssPatronal: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">RAT / FAP (%)</label>
                            <input
                                type="number"
                                value={params.rates.rat}
                                onChange={e => setParams({ ...params, rates: { ...params.rates, rat: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">FGTS Mensal (%)</label>
                            <input
                                type="number"
                                value={params.rates.fgts}
                                onChange={e => setParams({ ...params, rates: { ...params.rates, fgts: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Multa FGTS Rescisório (%)</label>
                            <input
                                type="number"
                                value={params.rates.fgtsPenalty}
                                onChange={e => setParams({ ...params, rates: { ...params.rates, fgtsPenalty: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Provisão Aviso Prévio (%)</label>
                            <input
                                type="number"
                                value={params.rates.noticePeriod}
                                onChange={e => setParams({ ...params, rates: { ...params.rates, noticePeriod: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-brand-orange transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* SETOR 2: CUSTOS OPERACIONAIS (VALORES FIXOS) */}
                <div className="space-y-8">
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                        <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Custos Indiretos (Provisão Mensal)</h4>
                    </div>

                    <div className="bg-surface-secondary/30 border border-border p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Contabilidade (R$ por Vida)</label>
                            <input
                                type="number"
                                value={params.costs.accountingPerHead}
                                onChange={e => setParams({ ...params, costs: { ...params.costs, accountingPerHead: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Exames Médicos (Rateio R$)</label>
                            <input
                                type="number"
                                value={params.costs.medicalExamsMonthly}
                                onChange={e => setParams({ ...params, costs: { ...params.costs, medicalExamsMonthly: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Treinamentos (Rateio R$)</label>
                            <input
                                type="number"
                                value={params.costs.trainingMonthly}
                                onChange={e => setParams({ ...params, costs: { ...params.costs, trainingMonthly: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Uniformes & EPIs (Rateio R$)</label>
                            <input
                                type="number"
                                value={params.costs.uniformsEPIMonthly}
                                onChange={e => setParams({ ...params, costs: { ...params.costs, uniformsEPIMonthly: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-black outline-none focus:border-emerald-500 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-blue/5 border border-brand-blue/10 p-10 rounded-[3rem] flex flex-col md:flex-row items-center gap-8 shadow-inner">
                <div className="h-16 w-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                    <Info className="h-8 w-8" />
                </div>
                <div className="text-center md:text-left space-y-2">
                    <p className="text-[10px] text-brand-blue font-[1000] uppercase tracking-[0.2em]">Impacto Global de Governança</p>
                    <p className="text-xs text-text-muted leading-relaxed font-bold max-w-4xl mx-auto italic">
                        "Alterações nestas configurações afetam instantaneamente o **Módulo de P&L Individual**, o **Simulador de Rescisão** e os relatórios de **Provisão de Encargos**.
                        Certifique-se de validar as alíquotas com sua assessoria contábil antes de aplicar as mudanças."
                    </p>
                </div>
            </div>
        </div>
    );
}
