
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Calendar, CreditCard, Search, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { getLoanInstallmentsByPeriod, createLoan, deleteLoan } from '../actions/loans';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/shared/components/ui/command';
import { cn } from '@/lib/utils';

interface LoanTabProps {
    periodId: string;
    isClosed: boolean;
}

export function LoanTab({ periodId, isClosed }: LoanTabProps) {
    const [loading, setLoading] = useState(true);
    const [installments, setInstallments] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [openPopover, setOpenPopover] = useState(false);
    const [totalAmount, setTotalAmount] = useState('');
    const [installmentsCount, setInstallmentsCount] = useState('1');
    const [reason, setReason] = useState('');

    useEffect(() => {
        loadData();
    }, [periodId]);

    async function loadData() {
        setLoading(true);
        const [instRes, empRes] = await Promise.all([
            getLoanInstallmentsByPeriod(periodId),
            getEmployees({ status: 'ACTIVE' })
        ]);

        if (instRes.success) setInstallments(instRes.data || []);
        if (empRes.success) setEmployees(empRes.data || []);
        setLoading(false);
    }

    async function handleAdd() {
        if (!selectedEmployeeId || !totalAmount || !installmentsCount) {
            toast.error('Preencha os campos obrigatórios.');
            return;
        }

        // Simplificação: assume que o empréstimo começa no mês atual do período
        // Em um sistema real, buscaríamos a data de início do período (period.month/year)
        // Por agora, vamos usar a data atual como referência para o início.
        const res = await createLoan({
            employeeId: selectedEmployeeId,
            totalAmount: parseFloat(totalAmount),
            installmentsCount: parseInt(installmentsCount),
            reason,
            startDate: new Date(),
        });

        if (res.success) {
            toast.success('Empréstimo contratado e parcelas geradas!');
            setIsAdding(false);
            setSelectedEmployeeId('');
            setTotalAmount('');
            setInstallmentsCount('1');
            setReason('');
            loadData();
        } else {
            toast.error(res.error || 'Erro ao processar empréstimo.');
        }
    }

    async function handleDelete(loanId: string) {
        if (!confirm('Deseja excluir este empréstimo e TODAS as suas parcelas?')) return;
        const res = await deleteLoan(loanId, periodId);
        if (res.success) {
            toast.success('Empréstimo removido.');
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
                <p className="text-slate-500 font-medium">Carregando empréstimos...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 italic">Empréstimos Consignados (Parcelados)</h2>
                    <p className="text-sm text-slate-500">Gestão de empréstimos com desconto automático em múltiplas parcelas.</p>
                </div>
                {!isClosed && (
                    <Button onClick={() => setIsAdding(!isAdding)} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Empréstimo
                    </Button>
                )}
            </div>

            {isAdding && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border-2 border-indigo-100 dark:border-indigo-900/30 shadow-lg animate-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Colaborador</label>
                            <Popover open={openPopover} onOpenChange={setOpenPopover}>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
                                        {selectedEmployeeId ? employees.find(e => e.id === selectedEmployeeId)?.name : "Selecionar..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 p-0 bg-white dark:bg-slate-900 shadow-xl" align="start">
                                    <Command>
                                        <CommandInput placeholder="Buck..." />
                                        <CommandList>
                                            <CommandEmpty>Não encontrado.</CommandEmpty>
                                            <CommandGroup>
                                                {employees.map((emp: any) => (
                                                    <CommandItem
                                                        key={emp.id}
                                                        value={emp.name}
                                                        onSelect={() => { setSelectedEmployeeId(emp.id); setOpenPopover(false); }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", selectedEmployeeId === emp.id ? "opacity-100" : "opacity-0")} />
                                                        {emp.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Total (R$)</label>
                            <input
                                type="number"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                value={totalAmount}
                                onChange={(e) => setTotalAmount(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Parcelas</label>
                            <select
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                value={installmentsCount}
                                onChange={(e) => setInstallmentsCount(e.target.value)}
                            >
                                {[1, 2, 3, 4, 5, 6, 12, 18, 24].map(n => (
                                    <option key={n} value={n}>{n}x</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Motivo</label>
                            <input
                                type="text"
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-slate-50 dark:bg-slate-900"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={handleAdd} className="flex-1 bg-emerald-600 hover:bg-emerald-700">Contratar</Button>
                            <Button variant="ghost" onClick={() => setIsAdding(false)}>X</Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-500">Colaborador</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Parcela Atual</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Valor Parcela</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Motivo de Empréstimo</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {installments.map((inst: any) => (
                            <tr key={inst.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{inst.employeeName}</div>
                                    <div className="text-[10px] text-slate-400">Total: {formatCurrency(inst.totalAmount)}</div>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {inst.installmentNumber} de {inst.installmentsCount}
                                </td>
                                <td className="px-6 py-4 font-black text-rose-600 dark:text-rose-400">
                                    {formatCurrency(inst.amount)}
                                </td>
                                <td className="px-6 py-4 text-slate-500 italic max-w-xs truncate">
                                    {inst.reason || '-'}
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className={
                                        inst.status === 'PAID'
                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                            : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                    }>
                                        {inst.status === 'PAID' ? 'QUITADA' : 'A DESCONTAR'}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        {!isClosed && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-red-500 hover:bg-red-50"
                                                onClick={() => handleDelete(inst.loanId)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {installments.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                                    Nenhuma parcela de empréstimo prevista para este período.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    🔍 **Info**: As parcelas são descontadas automaticamente no holerite mensal através da rubrica **5005**.
                    Ao excluir um empréstimo aqui, todas as parcelas futuras também serão removidas do sistema.
                </p>
            </div>
        </div>
    );
}
