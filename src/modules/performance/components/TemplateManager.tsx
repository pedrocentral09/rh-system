'use client';

import { useState, useEffect } from 'react';
import { getEvaluationTemplates, createEvaluationTemplate, updateEvaluationTemplate, deleteEvaluationTemplate } from '../actions/templates';
import { getReviewQuestions } from '../actions/cycles';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Check, X, ChevronRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export function TemplateManager() {
    const [templates, setTemplates] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        methodology: 'TOP_DOWN',
        description: '',
        questionIds: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const [templatesRes, questionsRes] = await Promise.all([
            getEvaluationTemplates(),
            getReviewQuestions()
        ]);

        if (templatesRes.success) setTemplates(templatesRes.data || []);
        if (questionsRes.success) setQuestions(questionsRes.data || []);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!formData.name) {
            toast.error('O nome do modelo é obrigatório');
            return;
        }

        if (formData.questionIds.length === 0) {
            toast.error('Selecione pelo menos uma pergunta');
            return;
        }

        const res = editingId
            ? await updateEvaluationTemplate(editingId, formData)
            : await createEvaluationTemplate(formData);

        if (res.success) {
            toast.success(editingId ? 'Modelo atualizado!' : 'Modelo criado!');
            setIsAdding(false);
            setEditingId(null);
            setFormData({ name: '', methodology: 'TOP_DOWN', description: '', questionIds: [] });
            loadData();
        } else {
            toast.error(res.error || 'Erro ao salvar modelo');
        }
    };

    const handleEdit = (template: any) => {
        setFormData({
            name: template.name,
            methodology: template.methodology || 'TOP_DOWN',
            description: template.description || '',
            questionIds: template.questions.map((q: any) => q.id)
        });
        setEditingId(template.id);
        setIsAdding(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este modelo?')) return;
        const res = await deleteEvaluationTemplate(id);
        if (res.success) {
            toast.success('Modelo excluído');
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const toggleQuestion = (id: string) => {
        setFormData(prev => ({
            ...prev,
            questionIds: prev.questionIds.includes(id)
                ? prev.questionIds.filter(qid => qid !== id)
                : [...prev.questionIds, id]
        }));
    };

    if (loading && !isAdding) return <div className="p-10 text-center text-slate-500">Carregando modelos...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Modelos de Avaliação</h2>
                    <p className="text-xs text-slate-500">Defina conjuntos de perguntas e metodologias para suas avaliações</p>
                </div>
                {!isAdding && (
                    <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                        <Plus className="w-4 h-4" /> Novo Modelo
                    </Button>
                )}
            </div>

            {isAdding ? (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Nome do Modelo</label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Avaliação Trimestral Comercial"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-slate-500">Metodologia</label>
                            <select
                                className="w-full h-10 px-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
                                value={formData.methodology}
                                onChange={e => setFormData({ ...formData, methodology: e.target.value })}
                            >
                                <option value="TOP_DOWN">Top-Down (Gestor avalia)</option>
                                <option value="360">360 Graus (Vários avaliadores)</option>
                                <option value="SELF">Auto-Avaliação</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-end">
                            <label className="text-xs font-bold uppercase text-slate-500">Selecionar Perguntas ({formData.questionIds.length})</label>
                            <div className="text-[10px] text-slate-400">Clique para selecionar/deselecionar</div>
                        </div>

                        <div className="max-height-[400px] overflow-y-auto border border-slate-100 dark:border-slate-700 rounded-lg p-2 space-y-2">
                            {Object.entries(
                                questions.reduce((acc, q) => {
                                    (acc[q.category] = acc[q.category] || []).push(q);
                                    return acc;
                                }, {} as any)
                            ).map(([category, items]: [string, any]) => (
                                <div key={category} className="space-y-1">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-50 dark:bg-slate-900/50 rounded-md">{category}</div>
                                    {items.map((q: any) => (
                                        <div
                                            key={q.id}
                                            onClick={() => toggleQuestion(q.id)}
                                            className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors ${formData.questionIds.includes(q.id)
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-700/50 border-l-4 border-transparent'
                                                }`}
                                        >
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.questionIds.includes(q.id) ? 'bg-blue-500 border-blue-500' : 'border-slate-300'
                                                }`}>
                                                {formData.questionIds.includes(q.id) && <Check className="w-3 h-3 text-white" />}
                                            </div>
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{q.text}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <Button variant="ghost" onClick={() => { setIsAdding(false); setEditingId(null); }}>Cancelar</Button>
                        <Button onClick={handleSave} className="gap-2">
                            <Check className="w-4 h-4" /> {editingId ? 'Atualizar Modelo' : 'Salvar Modelo'}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map(tmp => (
                        <div key={tmp.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                            <div className="space-y-2">
                                <div className="flex justify-between items-start">
                                    <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{tmp.name}</h3>
                                    <Badge variant="secondary" className="text-[10px] uppercase">{tmp.methodology}</Badge>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 uppercase font-medium">
                                    <span className="flex items-center gap-1"><Check className="w-3 h-3" /> {tmp._count.questions} Perguntas</span>
                                    <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3" /> {tmp._count.routines} Rotinas</span>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEdit(tmp)} className="h-8 w-8 p-0">
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDelete(tmp.id)} className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {templates.length === 0 && (
                        <div className="col-span-full py-10 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                            Nenhum modelo criado ainda. Comece criando o primeiro!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
