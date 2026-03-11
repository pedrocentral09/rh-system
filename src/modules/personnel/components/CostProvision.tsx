'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    Info,
    Layers,
    Activity,
    ShieldCheck,
    PieChart,
    ChevronDown,
    ChevronUp,
    DollarSign,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSystemParameters, SystemParameters } from '@/modules/configuration/actions/settings';

interface CostProvisionProps {
    employee: any;
}

export function CostProvision({ employee }: CostProvisionProps) {
    const baseSalary = Number(employee.contract?.baseSalary || 0);

    // Variáveis mensais editáveis para simulação dinâmica
    const [overtime, setOvertime] = useState(0);
    const [dobras, setDobras] = useState(0);
    const [folgas, setFolgas] = useState(0);

    const [params, setParams] = useState<SystemParameters | null>(null);
    const [loadingParams, setLoadingParams] = useState(true);

    useEffect(() => {
        getSystemParameters().then(res => {
            if (res.success && res.data) setParams(res.data);
            setLoadingParams(false);
        });
    }, []);

    const calculation = useMemo(() => {
        if (!params) return null;

        // Base de proventos variáveis
        const totalEarnings = baseSalary + overtime + dobras + folgas;

        // 1. Provisões Mensais de Verbas Finais
        const decimoTerceiro = totalEarnings / 12;
        const ferias = totalEarnings / 12;
        const tercoFerias = ferias / 3;

        // 2. Encargos Sociais sobre Proventos + Provisões
        const baseCalculoEncargos = totalEarnings + decimoTerceiro + ferias + tercoFerias;

        const inssPatronal = baseCalculoEncargos * (params.rates.inssPatronal / 100);
        const rat = baseCalculoEncargos * (params.rates.rat / 100);
        const fgts = baseCalculoEncargos * (params.rates.fgts / 100);

        // 3. Provisões de Rescisão (Mensalizadas)
        const multaFGTSProvision = fgts * (params.rates.fgtsPenalty / 100);
        const avisoPrevioProvision = totalEarnings * (params.rates.noticePeriod / 100);
        const fgtsAvisoPrevio = avisoPrevioProvision * (params.rates.fgts / 100);

        // 4. Benefícios e Custos Fixos Estimados (Mensal)
        const valeTransporte = Number(employee.contract?.transportVoucherValue || 0);
        const contabilidade = params.costs.accountingPerHead;
        const examesMedicos = params.costs.medicalExamsMonthly;
        const treinamentos = params.costs.trainingMonthly;
        const uniformesEPIs = params.costs.uniformsEPIMonthly;

        const totalCost = totalEarnings +
            decimoTerceiro + ferias + tercoFerias +
            inssPatronal + rat + fgts +
            multaFGTSProvision + avisoPrevioProvision + fgtsAvisoPrevio +
            valeTransporte + contabilidade + examesMedicos + treinamentos + uniformesEPIs;

        return {
            totalEarnings,
            provisions: [
                { label: '13º Salário (Anualizado)', value: decimoTerceiro },
                { label: 'Férias (Anualizado)', value: ferias },
                { label: '1/3 Constitucional Férias', value: tercoFerias },
                { label: 'Aviso Prévio (Provisão)', value: avisoPrevioProvision },
            ],
            taxes: [
                { label: `INSS Patronal (${params.rates.inssPatronal}%)`, value: inssPatronal },
                { label: `RAT (${params.rates.rat.toFixed(1)}%)`, value: rat },
                { label: `FGTS Mensal (${params.rates.fgts}%)`, value: fgts },
                { label: 'FGTS sobre Provisões', value: (decimoTerceiro + ferias + tercoFerias) * (params.rates.fgts / 100) },
                { label: `Multa FGTS Rec. (${params.rates.fgtsPenalty}%)`, value: multaFGTSProvision },
                { label: 'FGTS Aviso Prévio', value: fgtsAvisoPrevio },
            ],
            operational: [
                { label: 'Vale Transporte', value: String(valeTransporte) },
                { label: 'Contabilidade (Taxa/Vida)', value: contabilidade },
                { label: 'Saúde Ocupacional (ASO)', value: examesMedicos },
                { label: 'Treinamento & Desenvolvimento', value: treinamentos },
                { label: 'Uniformes & EPIs', value: uniformesEPIs },
            ],
            totalCost
        };
    }, [baseSalary, overtime, dobras, folgas, employee.contract, params]);

    if (loadingParams) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-6">
                <RefreshCw className="h-12 w-12 animate-spin text-brand-blue/40" />
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] animate-pulse italic text-center">
                    Sincronizando Parâmetros de Custos...
                </p>
            </div>
        );
    }

    if (!calculation) return null;

    return (
        <div className="space-y-10 py-6">
            <header className="flex items-center justify-between border-b border-border pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-3xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20 shadow-xl">
                        <PieChart className="h-7 w-7 text-brand-blue" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-[1000] text-text-primary uppercase tracking-tighter italic">Análise de <span className="text-brand-blue">Custo Real</span></h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">P&L Individual & Provisão de Passivo Trabalhista</p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-1">Custo Total Mensal (Estimado)</p>
                    <p className="text-4xl font-[1000] text-brand-blue tracking-tighter italic">
                        R$ {calculation.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Inputs de Variáveis */}
                <div className="space-y-6">
                    <div className="bg-surface-secondary/40 border border-border p-8 rounded-[2.5rem] shadow-inner relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity className="h-12 w-12 text-brand-blue" />
                        </div>

                        <h4 className="text-[10px] font-black text-text-primary uppercase tracking-widest mb-8 border-l-4 border-brand-blue pl-4">Variáveis de Remuneração</h4>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Horas Extras (Média/Mensal)</label>
                                <div className="relative group/input">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        type="number"
                                        value={overtime}
                                        onChange={(e) => setOvertime(Number(e.target.value))}
                                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-surface border border-border text-sm font-black text-text-primary outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Dobras / Feriados</label>
                                <div className="relative group/input">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        type="number"
                                        value={dobras}
                                        onChange={(e) => setDobras(Number(e.target.value))}
                                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-surface border border-border text-sm font-black text-text-primary outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">DSR / Dobra de Folga</label>
                                <div className="relative group/input">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-blue opacity-40 group-focus-within/input:opacity-100 transition-opacity" />
                                    <input
                                        type="number"
                                        value={folgas}
                                        onChange={(e) => setFolgas(Number(e.target.value))}
                                        className="w-full h-14 pl-12 pr-6 rounded-2xl bg-surface border border-border text-sm font-black text-text-primary outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-border/60">
                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-black text-text-muted uppercase">Base Salarial CLT</span>
                                <span className="text-sm font-black text-text-primary font-mono tracking-tighter italic">R$ {baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detalhamento de Custos */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bloco 1: Provisões de Verbas */}
                        <div className="p-8 rounded-[2.5rem] bg-surface-secondary/20 border border-border">
                            <div className="flex items-center gap-3 mb-6">
                                <Layers className="h-4 w-4 text-brand-orange" />
                                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Cálculo de Provisões</h4>
                            </div>
                            <div className="space-y-4">
                                {calculation.provisions.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-[10px] font-bold text-text-muted group-hover:text-text-primary transition-colors">{item.label}</span>
                                        <span className="text-xs font-black text-text-primary">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bloco 2: Custos Operacionais */}
                        <div className="p-8 rounded-[2.5rem] bg-surface-secondary/20 border border-border">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <h4 className="text-[10px] font-black text-text-primary uppercase tracking-[0.2em]">Outos Custos Fixos</h4>
                            </div>
                            <div className="space-y-4">
                                {calculation.operational.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <span className="text-[10px] font-bold text-text-muted group-hover:text-text-primary transition-colors">{item.label}</span>
                                        <span className="text-xs font-black text-text-primary">R$ {Number(item.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bloco Taxas: FULL WIDTH */}
                    <div className="p-8 rounded-[2.5rem] bg-brand-blue/5 border border-brand-blue/20 relative overflow-hidden">
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand-blue/10 blur-[100px] rounded-full -mb-32 -mr-32 pointer-events-none" />

                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="h-5 w-5 text-brand-blue" />
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-widest italic">Encargos Sociais e Trabalhistas (Taxas Patronais)</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 relative z-10">
                            {calculation.taxes.map((item, i) => (
                                <div key={i} className="flex justify-between items-center py-2 border-b border-brand-blue/10 group">
                                    <span className="text-[10px] font-black text-text-muted uppercase transition-all group-hover:translate-x-1">{item.label}</span>
                                    <span className="text-sm font-[1000] text-brand-blue italic">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/10 p-10 rounded-[3rem] text-center">
                <p className="text-[10px] text-amber-600 font-[900] uppercase tracking-[0.2em] mb-4">Metodologia de Cálculo de Provisão</p>
                <p className="text-xs text-text-muted leading-relaxed font-medium max-w-4xl mx-auto italic">
                    "Este relatório projeta o custo total de manutenção da vaga, incluindo a diluição mensal de encargos que serão pagos anualmente (13º e Férias) ou em um futuro desligamento.
                    O custo real de um colaborador CLT no Brasil pode variar entre <span className="font-black text-text-primary">60% a 90%</span> acima do salário nominal, dependendo do regime tributário (lucro presumido/real)."
                </p>
            </div>
        </div>
    );
}
