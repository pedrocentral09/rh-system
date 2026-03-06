'use client';

import { useState, useEffect } from 'react';
import {
    getEmployeeEvaluationRoutines,
    updateEmployeeEvaluationRoutine,
    getEvaluationRoutines,
    createEvaluationRoutine,
    toggleRoutineStatus,
    deleteEvaluationRoutine,
    processAutomatedRoutines
} from '../actions/routines';
import { getEvaluationTemplates } from '../actions/templates';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Plus, Play, Power, Trash2, Calendar, Users, Settings2 } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';

export function PerformanceRoutines({ employees: initialEmployees }: { employees: any[] }) {
    const [employees, setEmployees] = useState(initialEmployees);
    const [routines, setRoutines] = useState<any[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form for new routine
    const [formData, setFormData] = useState({
        name: '',
        templateId: '',
        frequencyMonths: 3,
        targetDepartments: [] as string[]
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [routinesRes, templatesRes, employeesRes] = await Promise.all([
            getEvaluationRoutines(),
            getEvaluationTemplates(),
            getEmployeeEvaluationRoutines()
        ]);

        if (routinesRes.success) setRoutines(routinesRes.data || []);
        if (templatesRes.success) setTemplates(templatesRes.data || []);
        if (employeesRes.success) setEmployees(employeesRes.data || []);
    };

    const handleCreateRoutine = async () => {
        if (!formData.name || !formData.templateId) {
            toast.error('Preencha os campos obrigatórios');
            return;
        }

        const res = await createEvaluationRoutine(formData);
        if (res.success) {
            toast.success('Rotina criada!');
            setIsAdding(false);
            setFormData({ name: '', templateId: '', frequencyMonths: 3, targetDepartments: [] });
            loadData();
        } else {
            toast.error(res.error);
        }
    };

    const handleToggleRoutine = async (id: string, current: boolean) => {
        const res = await toggleRoutineStatus(id, !current);
        if (res.success) {
            toast.success(current ? 'Rotina pausada' : 'Rotina ativada');
            loadData();
        }
    };

    const handleRunRoutine = async () => {
        setLoading(true);
        const res = await processAutomatedRoutines();
        if (res.success) {
            toast.success(`${res.count} ciclos processados!`);
            loadData();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleDeleteRoutine = async (id: string) => {
        if (!confirm('Excluir esta rotina?')) return;
        const res = await deleteEvaluationRoutine(id);
        if (res.success) {
            toast.success('Rotina excluída');
            loadData();
        }
    };

    // Derived departments from employees
    const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean))) as string[];

    return (
        <Tabs defaultValue="automated" className="space-y-6">
            <div className="flex justify-between items-center">
                <TabsList>
                    <TabsTrigger value="automated">Rotinas Automáticas</TabsTrigger>
                    <TabsTrigger value="individual">Prazos Individuais</TabsTrigger>
                </TabsList>

                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleRunRoutine} disabled={loading} className="gap-2">
                        <Play className="w-3 h-3" /> {loading ? 'Processando...' : 'Rodar Agora'}
                    </Button>
                    <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
                        <Plus className="w-3 h-3" /> Nova Rotina
                    </Button>
                </div>
            </div>

            <TabsContent value="automated" className="space-y-4">
                {isAdding && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 animate-in fade-in slide-in-from-top-4">
                        <h3 className="font-bold mb-4">Configurar Nova Rotina</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Nome da Rotina</label>
                                <Input
                                    className="bg-white"
                                    placeholder="Ex: Ciclo Trimestral Comercial"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Modelo de Perguntas</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white dark:bg-slate-900 text-sm"
                                    value={formData.templateId}
                                    onChange={e => setFormData({ ...formData, templateId: e.target.value })}
                                >
                                    <option value="">Selecione um modelo...</option>
                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Frequência (Meses)</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white dark:bg-slate-900 text-sm"
                                    value={formData.frequencyMonths}
                                    onChange={e => setFormData({ ...formData, frequencyMonths: Number(e.target.value) })}
                                >
                                    <option value="1">Mensal</option>
                                    <option value="3">Trimestral</option>
                                    <option value="6">Semestral</option>
                                    <option value="12">Anual</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-bold uppercase text-slate-500">Departamentos Alvo (Opcional)</label>
                            <div className="flex flex-wrap gap-2">
                                {departments.map(dept => (
                                    <Badge
                                        key={dept}
                                        variant={formData.targetDepartments.includes(dept) ? 'default' : 'outline'}
                                        className="cursor-pointer px-3 py-1"
                                        onClick={() => {
                                            setFormData(prev => ({
                                                ...prev,
                                                targetDepartments: prev.targetDepartments.includes(dept)
                                                    ? prev.targetDepartments.filter(d => d !== dept)
                                                    : [...prev.targetDepartments, dept]
                                            }));
                                        }}
                                    >
                                        {dept}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                            <Button onClick={handleCreateRoutine}>Salvar Rotina</Button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {routines.map(r => (
                        <div key={r.id} className={`bg-white dark:bg-slate-800 p-5 rounded-xl border ${r.isActive ? 'border-slate-200' : 'border-slate-100 opacity-70'} dark:border-slate-700 shadow-sm flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${r.isActive ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-400'}`}>
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 dark:text-white">{r.name}</h4>
                                        <Badge variant="outline" className="text-[10px]">{r.template?.name}</Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-slate-500 uppercase mt-1">
                                        <span className="flex items-center gap-1 font-medium"><Users className="w-3 h-3" /> {r.targetDepartments.length > 0 ? r.targetDepartments.join(', ') : 'Todos os Setores'}</span>
                                        <span>•</span>
                                        <span className="font-bold text-blue-600">A cada {r.frequencyMonths} meses</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Próximo Disparo</div>
                                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {r.nextRun ? format(new Date(r.nextRun), "dd/MM/yyyy") : '---'}
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => handleToggleRoutine(r.id, r.isActive)} title={r.isActive ? 'Pausar' : 'Ativar'}>
                                        <Power className={`w-4 h-4 ${r.isActive ? 'text-green-500' : 'text-slate-300'}`} />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteRoutine(r.id)} className="text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {routines.length === 0 && !isAdding && (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                            <Settings2 className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                            <p className="text-slate-400 text-sm italic">Nenhuma rotina automática configurada.</p>
                        </div>
                    )}
                </div>
            </TabsContent>

            <TabsContent value="individual">
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider">Colaborador</th>
                                <th className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-center">Frequência</th>
                                <th className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-center">Próxima Avaliação</th>
                                <th className="px-6 py-3 font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider text-right">Ação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {employees.map(emp => (
                                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800 dark:text-slate-200">{emp.name}</div>
                                        <div className="text-[10px] text-slate-500 uppercase">{emp.department || 'Geral'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <select
                                            className="text-xs border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 px-2 py-1"
                                            value={emp.evaluationInterval || ''}
                                            onChange={(e) => {
                                                const val = e.target.value ? Number(e.target.value) : null;
                                                updateEmployeeEvaluationRoutine(emp.id, { interval: val }).then(res => {
                                                    if (res.success) {
                                                        toast.success('Intervalo atualizado');
                                                        loadData();
                                                    }
                                                });
                                            }}
                                        >
                                            <option value="">Não Definida</option>
                                            <option value="1">Mensal</option>
                                            <option value="3">Trimestral</option>
                                            <option value="6">Semestral</option>
                                            <option value="12">Anual</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {emp.nextEvaluationDate ? (
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                {format(new Date(emp.nextEvaluationDate), "dd/MM/yyyy")}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic">Pendente</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right pr-10 italic text-[10px] text-slate-400">
                                        Baseado no aniversário
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TabsContent>
        </Tabs>
    );
}
