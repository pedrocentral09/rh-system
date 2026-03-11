'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutTemplate,
    Columns,
    Filter,
    Layers,
    FileDown,
    Download,
    Check,
    ChevronRight,
    Loader2,
    Search,
    X,
    FileText,
    Table as TableIcon,
    Save,
    Trash2,
    History
} from 'lucide-react';
import { REPORT_DATA_DICTIONARY, DataField } from '../utils/data-dictionary';
import { buildDynamicReportAction } from '../actions/bi-actions';
import { getReportTemplates, createReportTemplate, deleteReportTemplate } from '../actions/templates';
import { toast } from 'sonner';

export { ReportStudioPro as ReportGeneratorWizard };

export function ReportStudioPro() {
    const [selectedFields, setSelectedFields] = useState<string[]>(['name', 'jobRole', 'store']);
    const [groupBy, setGroupBy] = useState<string>('');
    const [filters, setFilters] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentTab, setCurrentTab] = useState<'FIELDS' | 'FILTERS' | 'GROUPING' | 'TEMPLATES'>('FIELDS');

    // Templates State
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [newTemplateName, setNewTemplateName] = useState('');
    const [isSavingTemplate, setIsSavingTemplate] = useState(false);

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        console.log('[Studio] Loading templates...');
        const res = await getReportTemplates();
        console.log('[Studio] Templates Result:', res);
        if (res.success) setTemplates(res.data || []);
        setIsLoadingTemplates(false);
    };

    const handleSaveTemplate = async () => {
        if (!newTemplateName.trim()) {
            toast.error('Dê um nome ao modelo.');
            return;
        }

        setIsSavingTemplate(true);
        const res = await createReportTemplate({
            name: newTemplateName,
            fieldIds: selectedFields,
            filters,
            groupBy: groupBy || undefined
        });

        if (res.success) {
            toast.success('Modelo salvo com sucesso!');
            setNewTemplateName('');
            loadTemplates();
        } else {
            toast.error(res.error || 'Erro ao salvar modelo.');
        }
        setIsSavingTemplate(false);
    };

    const handleApplyTemplate = (template: any) => {
        setSelectedFields(template.fieldIds || []);
        setFilters(template.filters || []);
        setGroupBy(template.groupBy || '');
        setCurrentTab('FIELDS');
        toast.info(`Configuração "${template.name}" aplicada!`);
    };

    const handleDeleteTemplate = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Excluir este modelo permanentemente?')) return;

        const res = await deleteReportTemplate(id);
        if (res.success) {
            toast.success('Modelo removido.');
            loadTemplates();
        }
    };

    const categories = Array.from(new Set(REPORT_DATA_DICTIONARY.map(f => f.category)));

    const handleToggleField = (id: string) => {
        setSelectedFields(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    const handleGenerate = async (format: 'PDF' | 'EXCEL') => {
        if (selectedFields.length === 0) {
            toast.error('Selecione pelo menos uma coluna.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await buildDynamicReportAction({
                fieldIds: selectedFields,
                filters,
                groupBy: groupBy || undefined,
                format
            });

            if (res.success && res.data) {
                const { content, filename, contentType } = res.data;
                const link = document.createElement('a');
                link.href = `data:${contentType};base64,${content}`;
                link.download = filename;
                link.click();
                toast.success('Relatório gerado com sucesso!');
            } else {
                toast.error(res.error || 'Erro ao gerar arquivo.');
            }
        } catch (error) {
            toast.error('Erro crítico no estúdio.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col lg:flex-row min-h-[600px] lg:h-[750px]">
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-20 bg-slate-950 flex lg:flex-col items-center justify-center lg:justify-start py-4 lg:py-8 gap-4 lg:gap-8 border-b lg:border-b-0 lg:border-r border-white/5">
                <div className="hidden lg:block p-3 bg-brand-orange/20 rounded-2xl mb-4">
                    <LayoutTemplate className="h-6 w-6 text-brand-orange" />
                </div>

                <NavButton active={currentTab === 'FIELDS'} onClick={() => setCurrentTab('FIELDS')} icon={Columns} label="Colunas" />
                <NavButton active={currentTab === 'FILTERS'} onClick={() => setCurrentTab('FILTERS')} icon={Filter} label="Filtros" />
                <NavButton active={currentTab === 'GROUPING'} onClick={() => setCurrentTab('GROUPING')} icon={Layers} label="Agrupar" />
                <NavButton active={currentTab === 'TEMPLATES'} onClick={() => setCurrentTab('TEMPLATES')} icon={History} label="Modelos" />
            </div>

            {/* Main Config Area */}
            <div className="flex-1 p-6 lg:p-10 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <header className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl lg:text-2xl font-black text-text-primary uppercase tracking-tighter italic">Studio <span className="text-brand-orange">Pro</span></h3>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Construtor de Relatórios Dinâmico</p>
                    </div>

                    {currentTab !== 'TEMPLATES' && (
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <input
                                type="text"
                                placeholder="Modelo..."
                                value={newTemplateName}
                                onChange={e => setNewTemplateName(e.target.value)}
                                className="h-10 px-4 rounded-xl bg-surface-secondary border border-border text-[10px] font-black uppercase tracking-widest outline-none focus:border-brand-orange transition-all flex-1 min-w-[120px] sm:w-32 lg:w-48"
                            />
                            <button
                                onClick={handleSaveTemplate}
                                disabled={isSavingTemplate}
                                title="Salvar Modelo"
                                className="h-10 px-4 rounded-xl bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-orange/20 disabled:opacity-50 whitespace-nowrap"
                            >
                                {isSavingTemplate ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                <span className="sm:inline">Salvar Modelo</span>
                            </button>
                        </div>
                    )}
                </header>

                <AnimatePresence mode="wait">
                    {currentTab === 'TEMPLATES' && (
                        <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                                <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <History className="h-4 w-4 text-brand-orange" /> Modelos Salvos
                                </h4>
                                <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">{templates.length} modelos localizados</span>
                            </div>

                            {isLoadingTemplates ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-brand-orange/40" />
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest animate-pulse">Consultando Biblioteca...</p>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-border rounded-[2rem]">
                                    <History className="h-10 w-10 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest truncate max-w-xs text-center">Nenhum modelo de relatório <br /> salvo no sistema ainda</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {templates.map(tpl => (
                                        <div
                                            key={tpl.id}
                                            onClick={() => handleApplyTemplate(tpl)}
                                            className="group relative p-6 rounded-3xl bg-surface-secondary border border-border hover:border-brand-orange transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                                                    className="p-2 rounded-lg hover:bg-rose-500/20 text-text-muted hover:text-rose-500 transition-all font-black uppercase tracking-widest text-[9px] flex items-center gap-2"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" /> Excluir
                                                </button>
                                            </div>

                                            <div className="flex items-start gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange shadow-inner group-hover:scale-110 transition-transform">
                                                    <LayoutTemplate className="h-6 w-6" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="text-[13px] font-black text-text-primary uppercase tracking-tight mb-1">{tpl.name}</h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        <span className="text-[9px] font-bold text-brand-orange bg-brand-orange/5 px-2 py-0.5 rounded-full border border-brand-orange/10 uppercase italic">
                                                            {tpl.fieldIds?.length || 0} Colunas
                                                        </span>
                                                        {tpl.groupBy && (
                                                            <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 uppercase">
                                                                Agrupado por: {tpl.groupBy}
                                                            </span>
                                                        )}
                                                        {tpl.filters?.length > 0 && (
                                                            <span className="text-[9px] font-bold text-indigo-400 bg-indigo-400/5 px-2 py-0.5 rounded-full border border-indigo-400/10 uppercase">
                                                                {tpl.filters.length} Filtros
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="self-center">
                                                    <ChevronRight className="h-5 w-5 text-text-muted group-hover:text-brand-orange group-hover:translate-x-1 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                    {currentTab === 'FIELDS' && (
                        <motion.div key="fields" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                            {categories.map(cat => (
                                <section key={cat}>
                                    <h4 className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-4 border-b border-brand-orange/20 pb-2">{cat}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {REPORT_DATA_DICTIONARY.filter(f => f.category === cat).map(field => (
                                            <button
                                                key={field.id}
                                                onClick={() => handleToggleField(field.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${selectedFields.includes(field.id)
                                                    ? 'bg-brand-orange/10 border-brand-orange text-brand-orange shadow-lg shadow-brand-orange/5'
                                                    : 'bg-surface-secondary border-border text-text-secondary hover:border-brand-orange/30'
                                                    }`}
                                            >
                                                <span className="text-[11px] font-bold uppercase tracking-tight">{field.label}</span>
                                                {selectedFields.includes(field.id) ? (
                                                    <div className="bg-brand-orange text-white rounded-full p-0.5">
                                                        <Check className="h-3 w-3" />
                                                    </div>
                                                ) : (
                                                    <div className="w-4 h-4 rounded-full border border-border group-hover:border-brand-orange/50" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </motion.div>
                    )}

                    {currentTab === 'GROUPING' && (
                        <motion.div key="grouping" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                            <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest mb-4">Escolha a chave de agrupamento</h4>
                            <div className="grid grid-cols-1 gap-3">
                                {REPORT_DATA_DICTIONARY.filter(f => ['string', 'LOCATION'].includes(f.type) || f.category === 'LOCATION').map(field => (
                                    <button
                                        key={field.id}
                                        onClick={() => setGroupBy(groupBy === field.id ? '' : field.id)}
                                        className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${groupBy === field.id
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                                            : 'bg-surface-secondary border-border text-text-secondary hover:border-emerald-500/30'
                                            }`}
                                    >
                                        <Layers className="h-5 w-5" />
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase">{field.label}</p>
                                            <p className="text-[9px] opacity-60">Agrupa os resultados por {field.label.toLowerCase()}</p>
                                        </div>
                                        {groupBy === field.id && <CheckCircle className="h-5 w-5 ml-auto" />}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setGroupBy('')}
                                    className={`p-5 rounded-2xl border text-left text-[11px] font-bold uppercase tracking-widest ${!groupBy ? 'border-brand-orange text-brand-orange bg-brand-orange/5' : 'border-border text-text-muted hover:border-brand-orange/30'}`}
                                >
                                    Nenhum (Visualização Plana)
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentTab === 'FILTERS' && (
                        <motion.div key="filters" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[11px] font-black text-text-primary uppercase tracking-widest">Filtros Inteligentes</h4>
                                <button
                                    onClick={() => {
                                        setFilters([...filters, { fieldId: 'name', operator: 'contains', value: '' }]);
                                    }}
                                    className="px-4 py-2 rounded-xl bg-brand-orange/10 border border-brand-orange/30 text-brand-orange text-[10px] font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all"
                                >
                                    + Adicionar Filtro
                                </button>
                            </div>

                            {filters.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-30 border-2 border-dashed border-border rounded-[2rem]">
                                    <Filter className="h-10 w-10 mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Nenhum filtro aplicado</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filters.map((f, idx) => (
                                        <div key={idx} className="flex flex-col md:flex-row gap-4 p-6 rounded-3xl bg-surface-secondary border border-border group relative">
                                            <div className="flex-1 space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Campo</label>
                                                <select
                                                    value={f.fieldId}
                                                    onChange={(e) => {
                                                        const newFilters = [...filters];
                                                        newFilters[idx].fieldId = e.target.value;
                                                        setFilters(newFilters);
                                                    }}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-border text-[11px] font-bold text-text-primary outline-none focus:border-brand-orange transition-colors"
                                                >
                                                    {REPORT_DATA_DICTIONARY.map(df => (
                                                        <option key={df.id} value={df.id}>{df.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Operador</label>
                                                <select
                                                    value={f.operator}
                                                    onChange={(e) => {
                                                        const newFilters = [...filters];
                                                        newFilters[idx].operator = e.target.value;
                                                        setFilters(newFilters);
                                                    }}
                                                    className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-border text-[11px] font-bold text-text-primary outline-none focus:border-brand-orange transition-colors"
                                                >
                                                    <option value="equals">Igual a</option>
                                                    <option value="contains">Contém</option>
                                                    <option value="gt">Maior que</option>
                                                    <option value="lt">Menor que</option>
                                                    <option value="gte">Maior ou igual</option>
                                                    <option value="lte">Menor ou igual</option>
                                                </select>
                                            </div>

                                            <div className="flex-[1.5] space-y-2">
                                                <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Valor</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={f.value}
                                                        onChange={(e) => {
                                                            const newFilters = [...filters];
                                                            newFilters[idx].value = e.target.value;
                                                            setFilters(newFilters);
                                                        }}
                                                        className="w-full h-12 px-4 rounded-xl bg-slate-950 border border-border text-[11px] font-bold text-text-primary outline-none focus:border-brand-orange transition-colors"
                                                        placeholder="Digite o valor..."
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            setFilters(filters.filter((_, i) => i !== idx));
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-rose-500/20 text-text-muted hover:text-rose-500 transition-all"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="p-6 rounded-3xl bg-brand-orange/5 border border-brand-orange/10">
                                <p className="text-[10px] text-text-muted font-bold leading-relaxed">
                                    <span className="text-brand-orange mr-1">ℹ</span>
                                    Você pode combinar múltiplos filtros. O sistema buscará registros que atendam a **todos** os critérios simultaneamente (Lógica AND).
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions / Summary Panel */}
            <div className="w-full lg:w-80 bg-surface-secondary border-t lg:border-t-0 lg:border-l border-border p-6 lg:p-10 flex flex-col">
                <div className="flex-1">
                    <h5 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Resumo do Relatório</h5>
                    <div className="space-y-4">
                        <SummaryItem icon={Columns} count={selectedFields.length} label="Colunas" />
                        <SummaryItem icon={Layers} count={groupBy ? 1 : 0} label="Agrupamento" />
                        <SummaryItem icon={Filter} count={filters.length} label="Filtros Ativos" />
                    </div>

                    <div className="mt-8 pt-8 border-t border-border">
                        <button
                            onClick={() => setCurrentTab('TEMPLATES')}
                            className="w-full p-4 rounded-2xl bg-surface-secondary border border-border hover:border-brand-orange transition-all group flex items-center gap-3"
                        >
                            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                                <History className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase text-text-primary">Biblioteca</p>
                                <p className="text-[9px] font-bold text-text-muted uppercase">Modelos Prontos</p>
                            </div>
                        </button>
                    </div>

                    <div className="mt-10 p-6 rounded-3xl bg-slate-950 border border-white/5 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Motor de Consulta Pronto</span>
                        </div>
                        <p className="text-[10px] text-white/60 font-bold leading-relaxed">O arquivo será gerado com latência zero baseado no estado atual do Studio.</p>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={() => handleGenerate('PDF')}
                        disabled={isLoading}
                        className="w-full h-16 rounded-2xl bg-brand-orange text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:brightness-110 disabled:opacity-50 transition-all shadow-xl shadow-brand-orange/20"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5" />}
                        Exportar PDF
                    </button>
                    <button
                        onClick={() => handleGenerate('EXCEL')}
                        disabled={isLoading}
                        className="w-full h-16 rounded-2xl bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-4 hover:bg-emerald-500 disabled:opacity-50 transition-all shadow-xl shadow-emerald-500/10"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <TableIcon className="h-5 w-5" />}
                        Exportar EXCEL
                    </button>
                </div>
            </div>
        </div>
    );
}

function NavButton({ active, icon: Icon, onClick, label }: { active: boolean, icon: any, onClick: () => void, label: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-1 group transition-all ${active ? 'text-brand-orange' : 'text-text-muted hover:text-text-primary'}`}
        >
            <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-brand-orange/10' : 'bg-transparent group-hover:bg-white/5'}`}>
                <Icon className="h-5 w-5" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

function SummaryItem({ icon: Icon, count, label }: { icon: any, count: number, label: string }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-text-muted" />
                <span className="text-[10px] font-bold text-text-secondary uppercase">{label}</span>
            </div>
            <span className="text-xs font-black text-text-primary">{count}</span>
        </div>
    );
}

function CheckCircle(props: any) {
    return (
        <div className="bg-emerald-500 text-white rounded-full p-1">
            <Check className="h-3 w-3" />
        </div>
    );
}
