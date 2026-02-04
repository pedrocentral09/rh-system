
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { addPayslipItem, deletePayslipItem, getPayrollEvents } from '../actions/edit';
import { toast } from 'sonner';

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
            toast.success('Item adicionado');
            setNewValue('');
            setNewRef('');
        } else {
            toast.error('Erro ao adicionar');
        }
    }

    async function handleDelete(itemId: string) {
        if (!confirm('Remover este item?')) return;
        setLoading(true);
        const res = await deletePayslipItem(itemId, payslip.id);
        setLoading(false);
        if (res.success) toast.success('Item removido');
    }

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Editar Holerite: {payslip.employee.name}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                    {/* Add New Item Form */}
                    <div className="p-4 bg-slate-50 rounded-lg border space-y-3">
                        <h4 className="font-semibold text-sm">Adicionar Evento Manual</h4>

                        <select
                            className="w-full h-9 rounded-md border px-3 text-sm"
                            value={selectedCode}
                            onChange={e => setSelectedCode(e.target.value)}
                        >
                            <option value="">Selecione a Rubrica...</option>
                            {events.map(e => (
                                <option key={e.id} value={e.code}>{e.code} - {e.name} ({e.type})</option>
                            ))}
                        </select>

                        <div className="flex space-x-2">
                            <input
                                type="number" placeholder="Ref (opcional)"
                                className="w-1/3 h-9 rounded-md border px-3 text-sm"
                                value={newRef} onChange={e => setNewRef(e.target.value)}
                            />
                            <input
                                type="number" placeholder="Valor (R$)"
                                className="w-2/3 h-9 rounded-md border px-3 text-sm"
                                value={newValue} onChange={e => setNewValue(e.target.value)}
                            />
                        </div>
                        <Button onClick={handleAdd} disabled={loading} size="sm" className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> Adicionar
                        </Button>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-slate-100 rounded-lg space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Total Proventos:</span>
                            <span className="font-semibold text-green-700">{formatCurrency(payslip.totalAdditions)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Descontos:</span>
                            <span className="font-semibold text-red-700">{formatCurrency(payslip.totalDeductions)}</span>
                        </div>
                        <div className="border-t border-slate-300 pt-2 flex justify-between text-base font-bold">
                            <span>Líquido:</span>
                            <span>{formatCurrency(payslip.netSalary)}</span>
                        </div>
                    </div>
                </div>

                {/* Items Table */}
                <div className="border rounded-md overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-100 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left">Cód</th>
                                <th className="px-3 py-2 text-left">Evento</th>
                                <th className="px-3 py-2 text-right">Ref</th>
                                <th className="px-3 py-2 text-right">Vencimentos</th>
                                <th className="px-3 py-2 text-right">Descontos</th>
                                <th className="px-3 py-2 center"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {payslip.items.map((item: any) => (
                                <tr key={item.id}>
                                    <td className="px-3 py-2 text-xs text-slate-500">{item.event?.code || '???'}</td>
                                    <td className="px-3 py-2">{item.name}</td>
                                    <td className="px-3 py-2 text-right text-slate-500">{item.reference}</td>
                                    <td className="px-3 py-2 text-right text-green-700">
                                        {item.type === 'EARNING' ? formatCurrency(item.value) : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right text-red-700">
                                        {item.type === 'DEDUCTION' ? formatCurrency(item.value) : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-slate-400 hover:text-red-600"
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
            </DialogContent>
        </Dialog>
    );
}
