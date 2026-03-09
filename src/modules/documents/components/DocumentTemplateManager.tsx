import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Search, Layers, Settings2, Trash2, Edit3, Save, HelpCircle, BadgeCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTemplatesAction, createTemplateAction, updateTemplateAction, deleteTemplateAction } from '../actions/templates';

interface Template {
    id: string;
    title: string;
    category: string;
    description: string | null;
    content: string;
    variables: string[];
    updatedAt: Date | string;
}

export function DocumentTemplateManager() {
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const categories = [
        { id: 'ALL', label: 'Todos os Documentos' },
        { id: 'CONTRACT', label: 'Contratos' },
        { id: 'WARNING', label: 'Disciplinares' },
        { id: 'AUTHORIZATION', label: 'Autorizações' },
        { id: 'PAYSLIP', label: 'Financeiro' },
    ];

    const [activeTab, setActiveTab] = useState('ALL');

    useEffect(() => {
        loadTemplates();
    }, []);

    const loadTemplates = async () => {
        setLoading(true);
        const res = await getTemplatesAction();
        if (res.success) {
            setTemplates(res.data as any);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        const res = editingTemplate
            ? await updateTemplateAction(editingTemplate.id, formData)
            : await createTemplateAction(formData);

        if (res.success) {
            toast.success(editingTemplate ? 'Matriz atualizada' : 'Matriz criada com sucesso');
            setIsCreating(false);
            setEditingTemplate(null);
            loadTemplates();
        } else {
            toast.error(res.error);
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir esta matriz? Esta ação é irreversível.')) return;

        const res = await deleteTemplateAction(id);
        if (res.success) {
            toast.success('Matriz excluída');
            loadTemplates();
        } else {
            toast.error(res.error);
        }
    };

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || t.category === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic flex items-center gap-3">
                        <Layers className="h-8 w-8 text-brand-orange" />
                        Gestão de Matrizes
                    </h2>
                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-[0.2em] mt-1 opacity-70">Modelos Inteligentes de Documentação RH</p>
                </div>
                <button
                    onClick={() => {
                        setEditingTemplate(null);
                        setIsCreating(true);
                    }}
                    className="h-14 px-8 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-2xl shadow-brand-orange/20 flex items-center justify-center gap-3 border-b-4 border-black/20 group"
                >
                    <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    Nova Matriz Digital
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-surface-secondary/40 p-4 rounded-[2rem] border border-border shadow-inner">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveTab(cat.id)}
                        className={`h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === cat.id ? 'bg-surface text-brand-orange border border-brand-orange/20 shadow-lg' : 'text-text-muted hover:text-text-primary'}`}
                    >
                        {cat.label}
                    </button>
                ))}
                <div className="flex-1 min-w-[200px] relative ml-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted opacity-40" />
                    <input
                        type="text"
                        placeholder="BUSCAR MODELO..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 bg-surface border border-border rounded-xl text-[10px] font-black tracking-widest focus:ring-2 focus:ring-brand-orange/20 transition-all placeholder:opacity-50"
                    />
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-geist">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-surface/50 rounded-[2.5rem] border border-border animate-pulse" />
                        ))
                    ) : filteredTemplates.map((template, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            key={template.id}
                            className="group bg-surface border border-border rounded-[2.5rem] p-8 hover:border-brand-orange/30 transition-all shadow-sm hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-orange/10 transition-all" />

                            <div className="flex flex-col h-full relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="h-14 w-14 bg-surface-secondary rounded-2xl border border-border flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                        <FileText className="h-7 w-7 text-brand-orange" />
                                    </div>
                                    <span className="text-[8px] font-black text-brand-orange uppercase tracking-widest bg-brand-orange/10 px-3 py-1 rounded-full border border-brand-orange/10">
                                        {template.category}
                                    </span>
                                </div>

                                <h4 className="text-lg font-black text-text-primary uppercase tracking-tighter leading-tight mb-3 group-hover:text-brand-orange transition-colors italic">
                                    {template.title}
                                </h4>
                                <p className="text-xs text-text-muted font-bold leading-relaxed mb-8 opacity-60 line-clamp-2">
                                    {template.description || 'Sem descrição.'}
                                </p>

                                <div className="mt-auto pt-6 border-t border-border/60 flex items-center justify-between">
                                    <div className="flex flex-wrap gap-1">
                                        {template.variables.slice(0, 3).map(v => (
                                            <span key={v} className="text-[7px] font-black text-text-muted/60 uppercase border border-border/40 px-1.5 py-0.5 rounded-md">
                                                {v}
                                            </span>
                                        ))}
                                        {template.variables.length > 3 && <span className="text-[7px] font-black text-text-muted/60">+{template.variables.length - 3}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTemplate(template);
                                                setIsCreating(true);
                                            }}
                                            className="h-9 w-9 rounded-xl bg-surface-secondary text-text-muted hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center active:scale-90"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(template.id)}
                                            className="h-9 w-9 rounded-xl bg-surface-secondary text-text-muted hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Empty State / Add Card */}
                {!loading && (
                    <button
                        onClick={() => {
                            setEditingTemplate(null);
                            setIsCreating(true);
                        }}
                        className="border-2 border-dashed border-border rounded-[2.5rem] p-10 flex flex-col items-center justify-center gap-4 text-text-muted hover:text-brand-orange hover:border-brand-orange/30 hover:bg-brand-orange/5 transition-all group"
                    >
                        <div className="h-16 w-16 rounded-full bg-surface-secondary flex items-center justify-center group-hover:scale-125 transition-all">
                            <Plus className="h-8 w-8" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Criar Nova Matriz Personalizada</span>
                    </button>
                )}
            </div>

            {/* Template Creation Modal */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                    >
                        <motion.form
                            onSubmit={handleSave}
                            initial={{ scale: 0.9, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 30 }}
                            className="bg-surface border border-border rounded-[3rem] w-full max-w-4xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-10 flex flex-col gap-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center border border-brand-orange/20 shadow-lg">
                                            <Edit3 className="h-7 w-7 text-brand-orange" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter italic leading-none">
                                                {editingTemplate ? 'Editar Matriz' : 'Nova Matriz Digital'}
                                            </h3>
                                            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1 opacity-60">Editor Estrutural de Documentos</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="h-12 w-12 rounded-xl hover:bg-surface-secondary text-text-muted flex items-center justify-center transition-all text-xl font-bold"
                                    >✕</button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Título do Modelo</label>
                                            <input
                                                name="title"
                                                required
                                                defaultValue={editingTemplate?.title}
                                                type="text"
                                                placeholder="EX: CONTRATO DE EXPERIÊNCIA"
                                                className="w-full h-14 bg-surface-secondary border border-border rounded-xl px-6 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-orange/20 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Categoria Legal</label>
                                            <select
                                                name="category"
                                                defaultValue={editingTemplate?.category || 'CONTRACT'}
                                                className="w-full h-14 bg-surface-secondary border border-border rounded-xl px-6 text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer appearance-none"
                                            >
                                                <option value="CONTRACT">CONTRATOS</option>
                                                <option value="WARNING">DISCIPLINARES</option>
                                                <option value="AUTHORIZATION">AUTORIZAÇÕES</option>
                                                <option value="PAYSLIP">FINANCEIRO</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Breve Descrição</label>
                                            <textarea
                                                name="description"
                                                defaultValue={editingTemplate?.description || ''}
                                                rows={2}
                                                placeholder="Para que serve este documento..."
                                                className="w-full bg-surface-secondary border border-border rounded-xl p-6 text-xs font-bold focus:ring-2 focus:ring-brand-orange/20 outline-none resize-none"
                                            />
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Variáveis Automáticas</label>
                                                <HelpCircle className="h-4 w-4 text-text-muted opacity-40 cursor-help" />
                                            </div>
                                            <div className="bg-brand-blue/5 border border-brand-blue/20 p-6 rounded-2xl space-y-4 shadow-inner">
                                                <p className="text-[9px] font-black text-brand-blue uppercase tracking-widest leading-relaxed">Clique para copiar a tag:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {['{{nome}}', '{{cpf}}', '{{cargo}}', '{{loja}}', '{{salario}}', '{{data_admissao}}', '{{cidade}}', '{{estado}}', '{{data_atual}}'].map(tag => (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(tag);
                                                                toast.success('Tag copiada!');
                                                            }}
                                                            key={tag}
                                                            className="px-3 py-1.5 bg-brand-blue/10 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all border border-brand-blue/20"
                                                        >
                                                            {tag}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 flex-1 flex flex-col">
                                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Conteúdo Base do Documento</label>
                                        <textarea
                                            name="content"
                                            required
                                            defaultValue={editingTemplate?.content}
                                            placeholder="Digite o conteúdo aqui..."
                                            className="flex-1 min-h-[300px] w-full bg-surface-secondary border border-border rounded-2xl p-8 text-sm font-medium leading-relaxed focus:ring-2 focus:ring-brand-orange/20 outline-none resize-none shadow-inner no-scrollbar"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-6 pt-4 border-t border-border">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingTemplate(null);
                                        }}
                                        className="h-14 px-10 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary transition-all"
                                    >Cancelar</button>
                                    <button
                                        disabled={isSaving}
                                        type="submit"
                                        className="h-14 px-12 rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 border-b-4 border-black/20 disabled:opacity-50"
                                    >
                                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                        {editingTemplate ? 'Salvar Alterações' : 'Publicar Matriz 🚀'}
                                    </button>
                                </div>
                            </div>
                        </motion.form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

