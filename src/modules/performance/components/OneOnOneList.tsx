'use client';

import { useState } from 'react';
import { createOneOnOne, deleteOneOnOne } from '@/modules/performance/actions/one-on-ones';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Employee {
    id: string;
    name: string;
    jobRole: { name: string } | null;
}

interface OneOnOne {
    id: string;
    date: Date;
    content: string;
    actionItems: string | null;
    feeling: string | null;
    employee: Employee;
    manager: { id: string, name: string };
}

interface Props {
    initialData: OneOnOne[];
    teamEmployees: Employee[];
}

const FEELING_EMOJIS: Record<string, string> = {
    'BOM': '😊 Bom',
    'NEUTRO': '😐 Neutro',
    'RUIM': '😟 Ruim',
};

export function OneOnOneList({ initialData, teamEmployees }: Props) {
    const [meetings, setMeetings] = useState<OneOnOne[]>(initialData);
    const [isCreating, setIsCreating] = useState(false);
    const [employeeId, setEmployeeId] = useState('');
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [content, setContent] = useState('');
    const [actionItems, setActionItems] = useState('');
    const [feeling, setFeeling] = useState('BOM');
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await createOneOnOne({
            employeeId,
            date: new Date(date),
            content,
            actionItems,
            feeling
        });

        if (result.success && result.data) {
            toast.success('Papo registrado com sucesso!');
            // Reload page to get hydrated relations or do manual state update. 
            // For simplicity, we just reload here.
            window.location.reload();
        } else {
            toast.error(result.error || 'Erro ao registrar 1-on-1');
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este registro?')) return;
        const result = await deleteOneOnOne(id);
        if (result.success) {
            setMeetings(meetings.filter(m => m.id !== id));
            toast.success('Registro excluído');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Registros de 1-on-1</h2>
                    <p className="text-xs text-slate-500">Histórico de alinhamentos contínuos com sua equipe.</p>
                </div>
                {!isCreating && (
                    <Button onClick={() => setIsCreating(true)}>+ Novo Registro</Button>
                )}
            </div>

            {isCreating && (
                <div className="bg-indigo-50 dark:bg-slate-800 p-6 rounded-xl border border-indigo-100 dark:border-slate-700">
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Colaborador (Liderado)</label>
                                <select
                                    required
                                    value={employeeId}
                                    onChange={e => setEmployeeId(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg dark:bg-slate-900 border"
                                >
                                    <option value="">Selecione...</option>
                                    {teamEmployees.map(emp => (
                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobRole?.name || 'Sem cargo'})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Data da Reunião</label>
                                <Input required type="date" value={date} onChange={e => setDate(e.target.value)} />
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Pauta e Pontos Discutidos</label>
                                <textarea
                                    required
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    placeholder="Escreva os principais pontos que foram discutidos..."
                                    className="w-full text-sm border-slate-200 rounded-lg p-2 min-h-[100px] border dark:bg-slate-900"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Próximos Passos (Itens de Ação)</label>
                                <Input value={actionItems} onChange={e => setActionItems(e.target.value)} placeholder="Ex: Gestor vai revisar meta X; Liderado vai fazer curso Y..." />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-600 block mb-1">Sentimento Geral do Liderado</label>
                                <select
                                    value={feeling}
                                    onChange={e => setFeeling(e.target.value)}
                                    className="w-full text-sm border-slate-200 rounded-lg dark:bg-slate-900 border"
                                >
                                    <option value="BOM">😊 Bom / Motivado</option>
                                    <option value="NEUTRO">😐 Neutro</option>
                                    <option value="RUIM">😟 Ruim / Preocupado</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                            <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>Cancelar</Button>
                            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar 1-on-1'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                {meetings.map(m => (
                    <div key={m.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative group">
                        <button
                            onClick={() => handleDelete(m.id)}
                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            🗑️
                        </button>

                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-700 font-bold rounded-full flex items-center justify-center">
                                    {m.employee.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{m.employee.name}</h3>
                                    <p className="text-[10px] text-slate-500">{m.employee.jobRole?.name}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${m.feeling === 'BOM' ? 'bg-emerald-100 text-emerald-700' : m.feeling === 'RUIM' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {FEELING_EMOJIS[m.feeling || 'NEUTRO']}
                                </span>
                                <p className="text-xs text-slate-500 mt-1">{format(new Date(m.date), 'dd/MM/yyyy')}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <h4 className="text-[10px] uppercase font-bold text-slate-400 mb-1">Pauta</h4>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{m.content}</p>
                            </div>

                            {m.actionItems && (
                                <div className="bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                                    <h4 className="text-[10px] uppercase font-bold text-indigo-500 mb-1">Próximos Passos</h4>
                                    <p className="text-sm text-indigo-900">{m.actionItems}</p>
                                </div>
                            )}

                            <div className="text-[10px] text-slate-400 text-right">
                                Gestor: {m.manager.name}
                            </div>
                        </div>
                    </div>
                ))}

                {meetings.length === 0 && (
                    <div className="col-span-full py-16 text-center border border-dashed border-slate-300 rounded-xl">
                        <span className="text-4xl mb-2 block">💬</span>
                        <h4 className="text-lg font-bold text-slate-700">Nenhum 1-on-1 registrado.</h4>
                        <p className="text-slate-500 text-sm mt-1">
                            Aproxime-se da sua equipe. Clique em "Novo Registro" para adicionar seu primeiro log de 1-on-1.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
