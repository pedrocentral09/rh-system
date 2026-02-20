
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Pencil, Trash2, Plus, Calculator, Wallet, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { addPayslipItem, deletePayslipItem, getPayrollEvents } from '../actions/edit';
import { toast } from 'sonner';
import { Card, CardContent } from '@/shared/components/ui/card';

interface EditProps {
    payslip: any;
    isOpen: boolean;
    onClose: () => void;
}

export function PayslipEditModal({ payslip, isOpen, onClose }: EditProps) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Add Item State
    const [selectedCode, setSelectedCode] = useState('');
    const [newValue, setNewValue] = useState('');
    const [newRef, setNewRef] = useState('');

    // Fetch events when opening if empty
    if (isOpen && events.length === 0) {
        getPayrollEvents().then(setEvents);
    }

    async function handleAdd() {
        if (!selectedCode || !newValue) return;
        setLoading(true);
        const res = await addPayslipItem(payslip.id, selectedCode, Number(newValue), Number(newRef));
        setLoading(false);

        if (res.success) {
            toast.success('Item adicionado com sucesso!');
            setNewValue('');
            setNewRef('');
        } else {
            toast.error('Erro ao adicionar item.');
        }
    }

    async function handleDelete(itemId: string) {
        if (!confirm('Deseja realmente remover este item do holerite?')) return;
        setLoading(true);
        const res = await deletePayslipItem(itemId, payslip.id);
        setLoading(false);
        if (res.success) toast.success('Item removido com sucesso!');
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl border-none shadow-2xl bg-white dark:bg-slate-950 p-0 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold flex items-center">
                            <Calculator className="mr-3 h-6 w-6" />
                            Editar Holerite
                        </DialogTitle>
                        <p className="text-indigo-100 text-sm mt-1 opacity-90">
                            Funcionário: <span className="font-semibold text-white">{payslip.employee.name}</span>
                        </p>
                    </DialogHeader>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Add New Item Form */}
                        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center">
                                    <Plus className="h-3 w-3 mr-1" /> Adicionar Evento
                                </h4>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Rubrica / Evento</label>
                                    <select
                                        className="w-full h-10 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:border-indigo-500 outline-none transition-all font-medium"
                                        value={selectedCode}
                                        onChange={e => setSelectedCode(e.target.value)}
                                    >
                                        <option value="">Selecione...</option>
                                        {events.map(e => (
                                            <option key={e.id} value={e.code}>{e.code} - {e.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="col-span-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Ref</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            className="w-full h-10 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:border-indigo-500 outline-none transition-all"
                                            value={newRef} onChange={e => setNewRef(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Valor (R$)</label>
                                        <input
                                            type="number"
                                            placeholder="0,00"
                                            className="w-full h-10 rounded-lg border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-sm focus:border-indigo-500 outline-none transition-all font-bold text-indigo-600"
                                            value={newValue} onChange={e => setNewValue(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleAdd} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-lg">
                                    <Plus className="h-4 w-4 mr-2" /> Inserir no Holerite
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card className="bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30 flex flex-col justify-between">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                        <ArrowUpCircle className="h-4 w-4 mr-2 text-emerald-500" />
                                        Total Proventos
                                    </div>
                                    <span className="font-bold text-lg text-emerald-600">{formatCurrency(payslip.totalAdditions)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center text-slate-600 dark:text-slate-400 font-medium">
                                        <ArrowDownCircle className="h-4 w-4 mr-2 text-red-500" />
                                        Total Descontos
                                    </div>
                                    <span className="font-bold text-lg text-red-600">{formatCurrency(payslip.totalDeductions)}</span>
                                </div>

                                <div className="pt-4 mt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">Salário Líquido</span>
                                            <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400">{formatCurrency(payslip.netSalary)}</span>
                                        </div>
                                        <Wallet className="h-10 w-10 text-indigo-200 dark:text-indigo-800 mb-1" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Items Table */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 dark:bg-slate-900 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Itens Lançados</h4>
                            <span className="text-xs font-medium text-slate-400">{payslip.items.length} eventos</span>
                        </div>
                        <div className="max-h-[250px] overflow-y-auto">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-white dark:bg-slate-950 sticky top-0 shadow-sm z-10">
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-3 text-left">Cód</th>
                                        <th className="px-4 py-3 text-left">Evento</th>
                                        <th className="px-4 py-3 text-center">Ref</th>
                                        <th className="px-4 py-3 text-right">Proventos</th>
                                        <th className="px-4 py-3 text-right">Descontos</th>
                                        <th className="px-4 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                                    {payslip.items.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-500">
                                                    {item.event?.code || '---'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                                {item.name}
                                                {item.source === 'SYNC' && <span className="ml-2 text-[8px] bg-amber-100 text-amber-700 px-1 rounded">PONTO</span>}
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-500 font-medium">
                                                {item.reference ? (
                                                    <span className="flex flex-col items-center">
                                                        <span className="text-[10px]">{item.reference}</span>
                                                        <span className="text-[7px] opacity-60 uppercase">
                                                            {item.event?.code === '5001' || item.event?.code === '5002' ? '%' : (item.event?.code === '1001' ? 'dias' : 'hrs')}
                                                        </span>
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-600">
                                                {item.type === 'EARNING' ? formatCurrency(item.value) : ''}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-red-500">
                                                {item.type === 'DEDUCTION' ? formatCurrency(item.value) : ''}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                                                    title="Remover"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
