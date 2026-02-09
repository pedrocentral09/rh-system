
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { calculateAllPayslips, calculatePayslip } from '../actions/calculation';
import { toast } from 'sonner';
import { Loader2, Calculator, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { Pencil, Printer, Mail } from 'lucide-react';
import { PayslipEditModal } from './PayslipEditModal';
import Link from 'next/link';
import { sendPayslipByEmail } from '../actions/email';

interface PayslipListProps {
    periodId: string;
    status: string;
    payslips: any[];
}

export function PayslipList({ periodId, status, payslips }: PayslipListProps) {
    const [loading, setLoading] = useState(false);
    const [calculatingId, setCalculatingId] = useState<string | null>(null);
    const [editingPayslip, setEditingPayslip] = useState<any | null>(null);

    async function handleCalculateAll() {
        if (!confirm('Deseja recalcular a folha de TODOS os funcionários? Isso pode demorar.')) return;

        setLoading(true);
        const res = await calculateAllPayslips(periodId);
        setLoading(false);

        if (res.success) {
            toast.success(`Processamento concluído! ${res.processed} recalculados.`);
        } else {
            toast.error('Erro ao processar folha.');
        }
    }

    async function handleCalculateSingle(employeeId: string) {
        setCalculatingId(employeeId);
        const res = await calculatePayslip(employeeId, periodId);
        setCalculatingId(null);

        if (res.success) {
            toast.success('Holerite recalculado!');
        } else {
            toast.error('Erro ao calcular.');
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                    <h3 className="text-sm font-medium text-slate-700">Ações da Competência</h3>
                    <p className="text-xs text-slate-500">
                        {payslips.length} holerites gerados
                    </p>
                </div>
                <div className="space-x-2">
                    <Button
                        onClick={async () => {
                            if (!confirm('Enviar e-mail para TODOS os funcionários desta competência?')) return;
                            const { sendAllPayslips } = await import('../actions/batch-email');
                            const res = await sendAllPayslips(periodId);
                            if (res.success) toast.success(res.message);
                            else toast.error(res.error);
                        }}
                        disabled={loading || status === 'CLOSED'}
                        variant="outline"
                        className="text-slate-600 border-slate-300 hover:bg-slate-50"
                    >
                        <Mail className="mr-2 h-4 w-4" />
                        Enviar Todos
                    </Button>
                    <Button
                        onClick={handleCalculateAll}
                        disabled={loading || status === 'CLOSED'}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                        Processar Todos
                    </Button>
                </div>
            </div>

            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-4 py-3 font-medium text-slate-500">Colaborador</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Salário Bruto</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Descontos</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Líquido</th>
                            <th className="px-4 py-3 font-medium text-slate-500">Status</th>
                            <th className="px-4 py-3 font-medium text-slate-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {payslips.map((payslip) => (
                            <tr key={payslip.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {payslip.employee.name}
                                    <div className="text-xs text-slate-400 font-normal">{payslip.employee.jobTitle}</div>
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {formatCurrency(payslip.grossSalary)}
                                </td>
                                <td className="px-4 py-3 text-red-600">
                                    {formatCurrency(payslip.totalDeductions)}
                                </td>
                                <td className="px-4 py-3 font-bold text-emerald-600">
                                    {formatCurrency(payslip.netSalary)}
                                </td>
                                <td className="px-4 py-3">
                                    {payslip.status === 'CALCULATED' ? (
                                        <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Calculado</Badge>
                                    ) : (
                                        <Badge variant="outline">Pendente</Badge>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right space-x-2">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        disabled={status === 'CLOSED'}
                                        onClick={() => setEditingPayslip(payslip)}
                                        title="Editar Manualmente"
                                    >
                                        <Pencil className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                    </Button>
                                    <Link href={`/print/payroll/${payslip.id}`} target="_blank">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            title="Imprimir Holerite"
                                        >
                                            <Printer className="h-4 w-4 text-slate-400 hover:text-slate-800" />
                                        </Button>
                                    </Link>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        title="Enviar por E-mail"
                                        onClick={async () => {
                                            if (!confirm(`Enviar por e-mail para ${payslip.employee.name}?`)) return;
                                            const res = await sendPayslipByEmail(payslip.id);
                                            if (res.success) toast.success(res.message);
                                            else toast.error(res.error);
                                        }}
                                    >
                                        <Mail className="h-4 w-4 text-slate-400 hover:text-orange-600" />
                                    </Button>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0"
                                        disabled={calculatingId === payslip.employeeId || status === 'CLOSED'}
                                        onClick={() => handleCalculateSingle(payslip.employeeId)}
                                        title="Recalcular"
                                    >
                                        {calculatingId === payslip.employeeId ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : <Calculator className="h-4 w-4 text-slate-400 hover:text-indigo-600" />}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {payslips.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    Nenhum holerite gerado ainda. Clique em "Processar Todos" para iniciar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {editingPayslip && (
                <PayslipEditModal
                    isOpen={!!editingPayslip}
                    onClose={() => setEditingPayslip(null)}
                    payslip={editingPayslip}
                />
            )}
        </div>
    );
}
