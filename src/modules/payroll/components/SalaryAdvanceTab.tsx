
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, CheckCircle2, XCircle, Search, UserPlus } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { getAdvancesByPeriod, createSalaryAdvance, updateAdvanceStatus, deleteAdvance } from '../actions/advances';
import { getEmployees } from '@/modules/personnel/actions/employees';

interface SalaryAdvanceTabProps {
    periodId: string;
    isClosed: boolean;
}

export function SalaryAdvanceTab({ periodId, isClosed }: SalaryAdvanceTabProps) {
    const [loading, setLoading] = useState(true);
    const [advances, setAdvances] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        loadData();
    }, [periodId]);

    async function loadData() {
        setLoading(true);
        const [advRes, empRes] = await Promise.all([
            getAdvancesByPeriod(periodId),
            getEmployees({ status: 'ACTIVE' })
        ]);

        if (advRes.success) setAdvances(advRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    }

    async function handleAdd() {
        if (!selectedEmployeeId || !amount) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        const res = await createSalaryAdvance({
            employeeId: selectedEmployeeId,
            periodId,
            amount: parseFloat(amount),
            description
        });

        if (res.success) {
            toast.success('Adiantamento registrado!');
            setIsAdding(false);
            setSelectedEmployeeId('');
            setAmount('');
            setDescription('');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao salvar.');
        }
    }

    async function handleToggleStatus(id: string, currentStatus: string) {
        let newStatus: 'PAID' | 'PENDING' = currentStatus === 'PAID' ? 'PENDING' : 'PAID';
        const res = await updateAdvanceStatus(id, newStatus, periodId);
        if (res.success) {
            toast.success(newStatus === 'PAID' ? 'Marcado como Pago' : 'Marcado como Pendente');
            loadData();
        } else {
            toast.error('Erro ao atualizar status.');
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Deseja excluir este adiantamento?')) return;
        const res = await deleteAdvance(id, periodId);
        if (res.success) {
            toast.success('Excluído com sucesso.');
            loadData();
        } else {
            toast.error('Erro ao excluir.');
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-slate-500 font-medium">Carregando adiantamentos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">Gestão de Vales (Adiantamentos)</h2>
                    <p className="text-sm text-slate-500">Lance adiantamentos individuais. Somente itens marcados como <span className="text-emerald-600 font-bold uppercase">Pago</span> serão descontados na folha final.</p>
                </div>
                {!isClosed && (
                    <Button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Adiantamento
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-lg animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador</label>
                            <select
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                value={selectedEmployeeId}
                                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            >
                                <option value="">Selecione...</option>
                                {employees.map((emp: any) => (
                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor (R$)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Observação</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                placeholder="Opcional..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Salvar</Button>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>Cancelar</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-500">Colaborador</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Valor Adiantado</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Observação</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {advances.map((adv: any) => (
                            <tr key={adv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-slate-100">
                                    {adv.employeeName}
                                </td>
                                <td className="px-6 py-4 font-black text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(adv.amount)}
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                                    {adv.description || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={
                                        adv.status === 'PAID'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-amber-100 text-amber-800 border-amber-200'
                                    }>
                                        {adv.status === 'PAID' ? 'PAGO (Descontará)' : 'PENDENTE'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {!isClosed && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className={adv.status === 'PAID' ? 'text-amber-600' : 'text-emerald-600'}
                                                    onClick={() => handleToggleStatus(adv.id, adv.status)}
                                                >
                                                    {adv.status === 'PAID' ? <XCircle className="h-4 w-4 mr-1" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                                                    {adv.status === 'PAID' ? 'Reverter' : 'Marcar Pago'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(adv.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {advances.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                                    Nenhum adiantamento registrado para esta competência.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/10 p-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">
                    💡 **Dica do Sistema**: O valor do adiantamento deve ser pago via PIX/Transferência por fora.
                    Ao marcar como **"PAGO"** aqui, o sistema automaticamente injetará a rubrica de desconto de adiantamento (5004) quando você recalcular o holerite mensal.
                </p>
            </div>
        </div>
    );
}
