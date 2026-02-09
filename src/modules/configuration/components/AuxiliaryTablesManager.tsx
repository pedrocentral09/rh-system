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
        <div className="space-y-6">
            <div className="flex space-x-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('roles')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'roles'
                        ? 'bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    💼 Cargos
                </button>
                <button
                    onClick={() => setActiveTab('sectors')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'sectors'
                        ? 'bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    🏢 Setores
                </button>
                <button
                    onClick={() => setActiveTab('reasons')}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all uppercase tracking-tight ${activeTab === 'reasons'
                        ? 'bg-white dark:bg-slate-800 text-brand-blue dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                >
                    🚪 Motivos de Desligamento
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form Section */}
                <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                    <CardHeader>
                        <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                            {isEditing ? '✨ Editar Item' : '➕ Novo Item'}
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            {activeTab === 'roles' && 'Adicione um novo cargo ao sistema.'}
                            {activeTab === 'sectors' && 'Adicione um novo setor organizacional.'}
                            {activeTab === 'reasons' && 'Defina motivos para desligamentos.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Nome / Título *</label>
                            <Input
                                value={currentItem.name || ''}
                                onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                                placeholder="Ex: Operador de Caixa"
                            />
                        </div>

                        {activeTab === 'roles' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">CBO (Opcional)</label>
                                    <Input
                                        value={currentItem.cbo || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, cbo: e.target.value })}
                                        placeholder="Ex: 4211-10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Descrição</label>
                                    <textarea
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        value={currentItem.description || ''}
                                        onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        placeholder="Breve descrição das responsabilidades..."
                                    />
                                </div>
                            </>
                        )}

                        <div className="flex gap-2 pt-2">
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex-1 bg-brand-blue hover:bg-blue-800 text-white font-bold"
                            >
                                {isEditing ? 'Salvar Alterações' : 'Criar Registro'}
                            </Button>
                            {isEditing && (
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setCurrentItem({});
                                    }}
                                    className="text-slate-500"
                                >
                                    Cancelar
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* List Section */}
                <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-100/80 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Nome</th>
                                    {activeTab === 'roles' && <th className="px-6 py-4">CBO</th>}
                                    <th className="px-6 py-4">Uso</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {loading && items.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 animate-pulse">Carregando dados...</td>
                                    </tr>
                                ) : items.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="px-6 py-12 text-center text-slate-400 italic">Nenhum registro encontrado.</td>
                                    </tr>
                                ) : items.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {item.name}
                                            {item.description && <p className="text-[10px] font-normal text-slate-500 mt-0.5 max-w-xs truncate">{item.description}</p>}
                                        </td>
                                        {activeTab === 'roles' && (
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500">{item.cbo || '-'}</td>
                                        )}
                                        <td className="px-6 py-4">
                                            <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200 dark:border-slate-600">
                                                {item._count?.employees || item._count?.contracts || 0} vínculos
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-brand-blue"
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setCurrentItem(item);
                                                }}
                                            >
                                                ✏️
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-red-500"
                                                onClick={() => handleDelete(item.id, item.name)}
                                            >
                                                🗑️
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
