'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart3, FileSpreadsheet, FileJson, FileText,
    Filter, ChevronRight, Download, Play, Save,
    Settings2, Database, LayoutGrid, CheckCircle2,
    Calendar, User, Store, Briefcase, DollarSign, Clock, AlertTriangle, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

type DataSource = 'EMPLOYEES' | 'ATTENDANCE' | 'PAYROLL' | 'PERFORMANCE' | 'DISCIPLINARY';

interface Field {
    id: string;
    label: string;
    category: string;
}

export function ReportBuilder() {
    const [source, setSource] = useState<DataSource>('EMPLOYEES');
    const [selectedFields, setSelectedFields] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewMode, setPreviewMode] = useState<'TABLE' | 'CHART'>('TABLE');

    const dataSources = [
        { id: 'EMPLOYEES', label: 'Efetivo (Pessoas)', icon: User, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { id: 'ATTENDANCE', label: 'Jornada (Ponto)', icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { id: 'PAYROLL', label: 'Financeiro (Custos)', icon: DollarSign, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { id: 'PERFORMANCE', label: 'Talento (Ciclos)', icon: BarChart3, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { id: 'DISCIPLINARY', label: 'Auditoria (Eventos)', icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ];

    const fieldsBySource: Record<DataSource, Field[]> = {
        EMPLOYEES: [
            { id: 'name', label: 'Nome Completo', category: 'Identidade' },
            { id: 'id', label: 'Matrícula', category: 'Identidade' },
            { id: 'cpf', label: 'CPF', category: 'Identidade' },
            { id: 'status', label: 'Status Atual', category: 'Contratual' },
            { id: 'store', label: 'Unidade/Loja', category: 'Estrutura' },
            { id: 'department', label: 'Setor', category: 'Estrutura' },
            { id: 'role', label: 'Cargo', category: 'Estrutura' },
            { id: 'admission', label: 'Data Admissão', category: 'Contratual' },
            { id: 'salary', label: 'Salário Base', category: 'Financeiro' },
        ],
        ATTENDANCE: [
            { id: 'name', label: 'Colaborador', category: 'Identidade' },
            { id: 'date', label: 'Data da Jornada', category: 'Tempo' },
            { id: 'shift_start', label: 'Entrada Real', category: 'Tempo' },
            { id: 'shift_end', label: 'Saída Real', category: 'Tempo' },
            { id: 'extra_hours', label: 'Horas Extras', category: 'Métricas' },
            { id: 'missing_minutes', label: 'Atrasos/Faltas', category: 'Métricas' },
            { id: 'store', label: 'Loja', category: 'Estrutura' },
        ],
        PAYROLL: [
            { id: 'name', label: 'Colaborador', category: 'Identidade' },
            { id: 'reference', label: 'Mês Referência', category: 'Tempo' },
            { id: 'gross_pay', label: 'Proventos Totais', category: 'Financeiro' },
            { id: 'deductions', label: 'Deduções/Descontos', category: 'Financeiro' },
            { id: 'net_pay', label: 'Líquido a Receber', category: 'Financeiro' },
            { id: 'cost_center', label: 'Centro de Custo', category: 'Estrutura' },
        ],
        PERFORMANCE: [
            { id: 'name', label: 'Participante', category: 'Identidade' },
            { id: 'cycle', label: 'Nome do Ciclo', category: 'Gestão' },
            { id: 'score', label: 'Nota Final', category: 'Métricas' },
            { id: 'manager', label: 'Avaliador', category: 'Estrutura' },
            { id: 'status', label: 'Status Avaliação', category: 'Gestão' },
        ],
        DISCIPLINARY: [
            { id: 'name', label: 'Colaborador', category: 'Identidade' },
            { id: 'type', label: 'Tipo (Advertência/Suspensão)', category: 'Legal' },
            { id: 'date', label: 'Data Ocorrência', category: 'Tempo' },
            { id: 'reason', label: 'Motivo Escrito', category: 'Legal' },
            { id: 'store', label: 'Loja Origem', category: 'Estrutura' },
        ]
    };

    const toggleField = (id: string) => {
        setSelectedFields(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleGenerate = () => {
        if (selectedFields.length === 0) {
            toast.error('Seleção Vazia', { description: 'Escolha pelo menos uma coluna para o relatório.' });
            return;
        }
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            toast.success('Relatório Gerado!', { description: 'Dados compilados com sucesso.' });
        }, 1500);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Control Panel */}
            <div className="xl:col-span-4 space-y-8">
                {/* 1. Data Source Selection */}
                <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-brand-orange/10 rounded-xl flex items-center justify-center border border-brand-orange/20">
                            <Database className="h-5 w-5 text-brand-orange" />
                        </div>
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic">Fonte de Dados</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {dataSources.map((ds) => (
                            <button
                                key={ds.id}
                                onClick={() => {
                                    setSource(ds.id as DataSource);
                                    setSelectedFields([]);
                                }}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${source === ds.id ? 'bg-surface-secondary border-brand-orange/30 shadow-lg' : 'bg-surface border-border hover:border-brand-orange/20'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${ds.bg}`}>
                                        <ds.icon className={`h-5 w-5 ${ds.color}`} />
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${source === ds.id ? 'text-text-primary' : 'text-text-muted'}`}>
                                        {ds.label}
                                    </span>
                                </div>
                                {source === ds.id && <CheckCircle2 className="h-4 w-4 text-brand-orange" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Column Picker */}
                <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                            <LayoutGrid className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="text-sm font-black text-text-primary uppercase tracking-widest italic">Colunas Personalizadas</h3>
                    </div>

                    <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {fieldsBySource[source].map((field) => (
                            <button
                                key={field.id}
                                onClick={() => toggleField(field.id)}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${selectedFields.includes(field.id) ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-surface-secondary/50 border-transparent hover:border-border'}`}
                            >
                                <div className="text-left">
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${selectedFields.includes(field.id) ? 'text-emerald-500' : 'text-text-primary'}`}>
                                        {field.label}
                                    </p>
                                    <span className="text-[8px] font-bold text-text-muted uppercase tracking-widest opacity-50">{field.category}</span>
                                </div>
                                <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${selectedFields.includes(field.id) ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border bg-surface'}`}>
                                    {selectedFields.includes(field.id) && <CheckCircle2 className="h-3 w-3" />}
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-border flex items-center justify-between">
                        <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">
                            {selectedFields.length} Selecionadas
                        </span>
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            className="h-12 px-8 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 disabled:opacity-50"
                        >
                            {isGenerating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
                            Gerar Relatório
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="xl:col-span-8 space-y-8">
                <div className="bg-surface border border-border rounded-[3rem] p-10 min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent opacity-30" />

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-8 border-b border-border/60">
                        <div className="flex items-center gap-4">
                            <button className="h-11 px-6 rounded-xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest text-text-primary hover:border-brand-orange/30 transition-all flex items-center gap-2">
                                <Filter className="h-4 w-4 text-brand-orange" />
                                Adicionar Filtros
                            </button>
                            <div className="h-11 bg-surface-secondary p-1 rounded-xl flex items-center gap-1 border border-border shadow-inner">
                                <button
                                    onClick={() => setPreviewMode('TABLE')}
                                    className={`h-9 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewMode === 'TABLE' ? 'bg-surface text-brand-orange shadow-md border border-brand-orange/10' : 'text-text-muted'}`}
                                >
                                    Tabela
                                </button>
                                <button
                                    onClick={() => setPreviewMode('CHART')}
                                    className={`h-9 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${previewMode === 'CHART' ? 'bg-surface text-brand-orange shadow-md border border-brand-orange/10' : 'text-text-muted'}`}
                                >
                                    Visual Gráfico
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button className="h-11 px-6 rounded-xl bg-[#1D6F42] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#155231] transition-all flex items-center gap-3 border-b-4 border-black/20">
                                <FileSpreadsheet className="h-4 w-4" />
                                Exportar Excel
                            </button>
                            <button className="h-11 px-6 rounded-xl bg-[#E01E2E] text-white text-[10px] font-black uppercase tracking-widest hover:bg-[#B31825] transition-all flex items-center gap-3 border-b-4 border-black/20">
                                <FileText className="h-4 w-4" />
                                Exportar PDF
                            </button>
                        </div>
                    </div>

                    {/* Data Visualization Area */}
                    <div className="flex-1 flex flex-col">
                        <AnimatePresence mode="wait">
                            {selectedFields.length > 0 ? (
                                <motion.div
                                    key="data-active"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1"
                                >
                                    {previewMode === 'TABLE' ? (
                                        <div className="overflow-x-auto rounded-3xl border border-border font-geist shadow-inner bg-surface-secondary/20">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-surface-secondary/60">
                                                        {selectedFields.map(fId => (
                                                            <th key={fId} className="px-6 py-5 text-[9px] font-black text-text-secondary uppercase tracking-[0.2em] border-b border-border">
                                                                {fieldsBySource[source].find(f => f.id === fId)?.label}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="text-text-primary text-[11px] font-bold">
                                                    {isGenerating ? (
                                                        [1, 2, 3, 4, 5, 6].map(row => (
                                                            <tr key={row} className="border-b border-border/40">
                                                                {selectedFields.map(fId => (
                                                                    <td key={fId} className="px-6 py-6 transition-all duration-500">
                                                                        <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden relative">
                                                                            <motion.div
                                                                                animate={{ x: ['-100%', '100%'] }}
                                                                                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                                                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                                                            />
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        [1, 2, 3, 4, 5].map(row => (
                                                            <tr key={row} className="border-b border-border/40 hover:bg-brand-orange/5 transition-colors group">
                                                                {selectedFields.map(fId => (
                                                                    <td key={fId} className="px-6 py-4 opacity-70 group-hover:opacity-100 italic transition-opacity">
                                                                        Exemplo de Dado
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                                            <div className="h-48 w-full max-w-lg bg-surface-secondary/40 border border-border rounded-3xl flex items-end justify-between p-10 gap-4 shadow-inner relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-t from-brand-orange/5 to-transparent opacity-50" />
                                                {[60, 90, 40, 70, 100, 30, 80].map((h, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ height: 0 }}
                                                        animate={{ height: `${h}%` }}
                                                        className="w-full bg-brand-orange/30 rounded-t-lg border-t-2 border-brand-orange/40 relative z-10"
                                                    />
                                                ))}
                                            </div>
                                            <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Projeção Inteligente</h4>
                                            <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                                Análise preditiva baseada nos últimos 6 meses de dados de {source}.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center space-y-8 p-20 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
                                >
                                    <div className="h-24 w-24 bg-surface-secondary rounded-[2rem] border border-border flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
                                        <BarChart3 className="h-10 w-10 text-brand-orange" />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic">Engine de Inteligência Off-line</h4>
                                        <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest max-w-xs leading-relaxed">
                                            Selecione as dimensões e métricas no painel lateral para construir sua visão analítica.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Sparkles className="h-4 w-4 text-brand-orange animate-pulse" />
                                        <span className="text-[9px] font-black text-brand-orange uppercase tracking-[.3em]">IA Pronta para Processar</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-10 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest italic font-geist">Criptografia Ativa</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-[8px] font-black text-text-muted uppercase tracking-widest italic font-geist">Auditoria em Tempo Real</span>
                            </div>
                        </div>
                        <div className="text-[8px] font-black text-text-muted/40 uppercase tracking-widest">Acesso Restrito: Administrador Central</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
