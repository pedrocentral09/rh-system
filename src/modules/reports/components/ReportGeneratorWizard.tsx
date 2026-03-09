'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, FileText, PieChart, Users, DollarSign, ShieldAlert, CheckCircle2, ChevronRight, Loader2, Download } from 'lucide-react';
import { generateReportAction } from '../actions/generator';
import { toast } from 'sonner';

export function ReportGeneratorWizard() {
    const [step, setStep] = useState<'AREA' | 'FORMAT' | 'GENERATING' | 'SUCCESS'>('AREA');
    const [area, setArea] = useState<string>('');
    const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF');
    const [isLoading, setIsLoading] = useState(false);

    const areas = [
        { id: 'PERSONNEL', label: 'Gestão de Capital Humano', desc: 'Ativos, demitidos e dados gerais', icon: Users, color: 'text-brand-orange', bg: 'bg-brand-orange/10' },
        { id: 'FINANCIAL', label: 'Projeção Financeira & Folha', desc: 'Custos operacionais e encargos', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'DISCIPLINARY', label: 'Medidas & Conformidade', desc: 'Auditoria de advertências e suspensões', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { id: 'PUNCTUALITY', label: 'Produtividade & Assiduidade', desc: 'Heatmap de frequência e faltas', icon: PieChart, color: 'text-sky-500', bg: 'bg-sky-500/10' }
    ];

    const handleGenerate = async (selectedFormat: 'PDF' | 'EXCEL') => {
        setFormat(selectedFormat);
        setStep('GENERATING');
        setIsLoading(true);

        try {
            const res = await generateReportAction(area as any, selectedFormat);

            if (res.success && res.data) {
                const { content, filename, contentType } = res.data;
                const link = document.createElement('a');
                link.href = `data:${contentType};base64,${content}`;
                link.download = filename;
                link.click();
                setStep('SUCCESS');
                toast.success('Relatório exportado com sucesso!');
            } else {
                toast.error(res.error || 'Falha na geração');
                setStep('FORMAT');
            }
        } catch (error) {
            toast.error('Erro crítico na exportação');
            setStep('FORMAT');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center border border-white/10 shadow-2xl">
                        <FileDown className="h-8 w-8 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Central de Exportação</h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Emissor de Documentos Corporativos [v1.0]</p>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'AREA' && (
                        <motion.div
                            key="area"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <h4 className="text-xs font-black text-text-primary uppercase tracking-widest mb-8">1. Selecione a Área de Inteligência</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {areas.map((a) => (
                                    <button
                                        key={a.id}
                                        onClick={() => { setArea(a.id); setStep('FORMAT'); }}
                                        className="flex items-center gap-6 p-6 rounded-3xl bg-surface-secondary border border-border hover:border-brand-orange/30 hover:bg-surface-hover transition-all group text-left"
                                    >
                                        <div className={`w-14 h-14 rounded-2xl ${a.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <a.icon className={`h-7 w-7 ${a.color}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-text-primary uppercase tracking-tight">{a.label}</p>
                                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest opacity-60 mt-1">{a.desc}</p>
                                        </div>
                                        <ChevronRight className="h-4 w-4 ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'FORMAT' && (
                        <motion.div
                            key="format"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            <div>
                                <button onClick={() => setStep('AREA')} className="text-[9px] font-black text-brand-orange uppercase tracking-widest mb-4 hover:underline">← Voltar à seleção</button>
                                <h4 className="text-xs font-black text-text-primary uppercase tracking-widest">2. Escolha o Formato de Saída</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleGenerate('PDF')}
                                    className="p-10 rounded-[2rem] bg-brand-orange/5 border border-brand-orange/20 hover:bg-brand-orange text-brand-orange hover:text-white transition-all group flex flex-col items-center gap-6 shadow-xl"
                                >
                                    <FileText className="h-16 w-16 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="text-sm font-black uppercase tracking-widest">Documento PDF</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Ideal para apresentações oficiais</p>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleGenerate('EXCEL')}
                                    className="p-10 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500 text-emerald-500 hover:text-white transition-all group flex flex-col items-center gap-6 shadow-xl"
                                >
                                    <Download className="h-16 w-16 group-hover:scale-110 transition-transform" />
                                    <div className="text-center">
                                        <p className="text-sm font-black uppercase tracking-widest">Planilha EXCEL</p>
                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Ideal para análise de dados</p>
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'GENERATING' && (
                        <motion.div
                            key="generating"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center py-20 animate-pulse"
                        >
                            <Loader2 className="h-16 w-16 text-brand-orange animate-spin mb-8" />
                            <p className="text-xs font-black text-text-primary uppercase tracking-[0.4em]">Compilando Metadados...</p>
                            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-4">Aguarde a finalização do dump securitizado</p>
                        </motion.div>
                    )}

                    {step === 'SUCCESS' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10"
                        >
                            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
                                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                            </div>
                            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic mb-2">Processamento Concluído</h4>
                            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mb-10 opacity-70">O arquivo foi assinado e preparado para download.</p>

                            <button
                                onClick={() => setStep('AREA')}
                                className="h-16 px-12 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange transition-all shadow-2xl"
                            >
                                Gerar Novo Relatório
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
