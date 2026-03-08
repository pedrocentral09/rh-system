'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import {
    getJobRoles, createJobRole, updateJobRole, deleteJobRole,
    getSectors, createSector, updateSector, deleteSector,
    getTerminationReasons, createTerminationReason, updateTerminationReason, deleteTerminationReason
} from '../actions/auxiliary';

type TableType = 'roles' | 'sectors' | 'reasons';

interface Item {
    id: string;
    name: string;
    cbo?: string;
    description?: string;
    _count?: {
        employees?: number;
        contracts?: number;
    };
}

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function AuxiliaryTablesManager() {
    const [activeTab, setActiveTab] = useState<TableType>('roles');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItem, setCurrentItem] = useState<Partial<Item>>({});

    const loadData = async () => {
        setLoading(true);
        let result;
        if (activeTab === 'roles') result = await getJobRoles();
        else if (activeTab === 'sectors') result = await getSectors();
        else result = await getTerminationReasons();

        if (result.success) {
            setItems(result.data || []);
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const handleSave = async () => {
        if (!currentItem.name) return toast.error('Nome é obrigatório');

        setLoading(true);
        let result;
        if (activeTab === 'roles') {
            if (currentItem.id) result = await updateJobRole(currentItem.id, currentItem as any);
            else result = await createJobRole(currentItem as any);
        } else if (activeTab === 'sectors') {
            if (currentItem.id) result = await updateSector(currentItem.id, { name: currentItem.name });
            else result = await createSector({ name: currentItem.name });
        } else {
            if (currentItem.id) result = await updateTerminationReason(currentItem.id, { name: currentItem.name });
            else result = await createTerminationReason({ name: currentItem.name });
        }

        if (result.success) {
            toast.success(currentItem.id ? 'Atualizado com sucesso' : 'Criado com sucesso');
            setIsEditing(false);
            setCurrentItem({});
            loadData();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Deseja excluir "${name}"?`)) return;

        setLoading(true);
        let result;
        if (activeTab === 'roles') result = await deleteJobRole(id);
        else if (activeTab === 'sectors') result = await deleteSector(id);
        else result = await deleteTerminationReason(id);

        if (result.success) {
            toast.success('Excluído com sucesso');
            loadData();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Custom Tabs */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-surface/60 backdrop-blur-xl border border-border rounded-2xl w-fit">
                {[
                    { id: 'roles', label: 'Cargos', icon: '💼' },
                    { id: 'sectors', label: 'Setores', icon: '🏢' },
                    { id: 'reasons', label: 'Motivos de Desligamento', icon: '🚪' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TableType)}
                        className={`relative px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${activeTab === tab.id
                            ? 'bg-brand-orange text-white shadow-[0_0_20px_rgba(var(--brand-orange-rgb),0.3)]'
                            : 'text-text-muted hover:text-text-primary hover:bg-text-primary/5'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-4">
                    <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[40px] rounded-full -mr-16 -mt-16 pointer-events-none" />

                        <div className="relative space-y-6">
                            <div>
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">
                                    {isEditing ? 'Atualizar' : 'Registrar'} <span className="text-indigo-400">Entidade</span>
                                </h3>
                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Configuração de Tabelas Auxiliares</p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="space-y-2 group">
                                    <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Identificação / Título</label>
                                    <Input
                                        className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary focus:border-indigo-500/30 transition-all"
                                        value={currentItem.name || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                        placeholder="Ex: Gerente Operacional"
                                    />
                                </div>

                                {activeTab === 'roles' && (
                                    <>
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Código CBO</label>
                                            <Input
                                                className="bg-text-primary/5 border-border rounded-2xl h-12 text-sm font-bold text-text-primary focus:border-indigo-500/30 transition-all font-mono"
                                                value={currentItem.cbo || ''}
                                                onChange={(e) => setCurrentItem({ ...currentItem, cbo: e.target.value })}
                                                placeholder="0000-00"
                                            />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="text-[9px] font-black text-text-muted uppercase tracking-widest ml-1">Descrição de Funções</label>
                                            <textarea
                                                className="w-full bg-text-primary/5 border border-border rounded-2xl p-4 text-sm font-bold text-text-primary focus:border-indigo-500/30 transition-all min-h-[120px] outline-none"
                                                value={currentItem.description || ''}
                                                onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                                                placeholder="Detalhamento das responsabilidades..."
                                            />
                                        </div>
                                    </>
                                )}

                                <div className="flex flex-col gap-2 pt-4">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="h-12 rounded-2xl bg-indigo-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-600 transition-all shadow-[0_0_20px_rgba(99,102,241,0.2)] flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>⚡</span>}
                                        {isEditing ? 'Confirmar Alterações' : 'Adicionar Novo Registro'}
                                    </button>

                                    {isEditing && (
                                        <button
                                            onClick={() => {
                                                setIsEditing(false);
                                                setCurrentItem({});
                                            }}
                                            className="h-10 text-[9px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
                                        >
                                            Descartar Edição
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* List Column */}
                <div className="lg:col-span-8">
                    <div className="bg-surface/40 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl relative">
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">
                                <div className="col-span-6">Dados do Registro</div>
                                {activeTab === 'roles' && <div className="col-span-2">CBO</div>}
                                <div className={`${activeTab === 'roles' ? 'col-span-2' : 'col-span-4'} text-center`}>Impacto</div>
                                <div className="col-span-2 text-right">Ações</div>
                            </div>

                            <div className="space-y-3">
                                <AnimatePresence mode="popLayout">
                                    {items.map((item, i) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.98 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.02 }}
                                            className="grid grid-cols-12 items-center px-8 py-5 bg-surface border border-border rounded-[1.5rem] hover:border-indigo-500/30 hover:scale-[1.01] hover:bg-text-primary/[0.02] transition-all duration-300 group"
                                        >
                                            <div className="col-span-6 min-w-0">
                                                <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">
                                                    {item.name}
                                                </h4>
                                                {item.description && (
                                                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest truncate mt-0.5">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>

                                            {activeTab === 'roles' && (
                                                <div className="col-span-2">
                                                    <span className="text-[11px] font-black text-text-muted font-mono bg-text-primary/5 px-2 py-0.5 rounded border border-border">
                                                        {item.cbo || '---'}
                                                    </span>
                                                </div>
                                            )}

                                            <div className={`${activeTab === 'roles' ? 'col-span-2' : 'col-span-4'} text-center`}>
                                                <div className="inline-flex items-center gap-2 bg-indigo-500/5 px-3 py-1 rounded-full border border-indigo-500/10">
                                                    <span className="text-[10px] font-black text-indigo-400">{item._count?.employees || item._count?.contracts || 0}</span>
                                                    <span className="text-[7px] font-black text-text-muted uppercase tracking-tighter">Vinculados</span>
                                                </div>
                                            </div>

                                            <div className="col-span-2 flex justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setIsEditing(true);
                                                        setCurrentItem(item);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="w-9 h-9 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-xs hover:bg-indigo-500 hover:text-white transition-all shadow-lg text-indigo-400"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id, item.name)}
                                                    className="w-9 h-9 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500/50 hover:text-white"
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {loading && items.length === 0 && (
                                    <div className="space-y-3">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-20 bg-text-primary/5 rounded-[1.5rem] animate-pulse" />
                                        ))}
                                    </div>
                                )}

                                {!loading && items.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 bg-text-primary/2 rounded-[2.5rem] border border-border border-dashed">
                                        <p className="text-[10px] font-black text-text-muted/40 uppercase tracking-[0.3em]">Nenhum registro localizado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
