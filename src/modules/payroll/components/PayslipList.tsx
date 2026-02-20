
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Calculator, Users, Pencil, Printer, Mail, Eye } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { PayslipEditModal } from './PayslipEditModal';
import { PayslipViewModal } from './PayslipViewModal';
import Link from 'next/link';
import { sendPayslipByEmail } from '../actions/email';
import { calculateAllPayslips, calculatePayslip } from '../actions/calculation';

interface PayslipListProps {
    periodId: string;
    status: string;
    payslips: any[];
}

export function PayslipList({ periodId, status, payslips }: PayslipListProps) {
    const [loading, setLoading] = useState(false);
    const [calculatingId, setCalculatingId] = useState<string | null>(null);
    const [editingPayslip, setEditingPayslip] = useState<any | null>(null);
    const [viewPayslip, setViewPayslip] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [selectedStore, setSelectedStore] = useState<string>('all');

    // Opções únicas de Empresas e Lojas presentes na lista
    const companies = Array.from(new Set(payslips.map(p => p.employee.contract?.company?.name).filter(Boolean)));
    const stores = Array.from(new Set(payslips.map(p => p.employee.contract?.store?.name).filter(Boolean)));

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

    const filteredPayslips = payslips.filter(p => {
        const matchesSearch = p.employee.name.toLowerCase().includes(search.toLowerCase());
        const matchesCompany = selectedCompany === 'all' || p.employee.contract?.company?.name === selectedCompany;
        const matchesStore = selectedStore === 'all' || p.employee.contract?.store?.name === selectedStore;
        return matchesSearch && matchesCompany && matchesStore;
    });

    // Calc Period Totals based on filtered list
    const periodTotals = filteredPayslips.reduce((acc, p) => ({
        gross: acc.gross + Number(p.grossSalary),
        deductions: acc.deductions + Number(p.totalDeductions),
        net: acc.net + Number(p.netSalary)
    }), { gross: 0, deductions: 0, net: 0 });

    return (
        <div className="space-y-6">
            {/* Resumo Financeiro do Período */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Bruto (Filtrado)</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(periodTotals.gross)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Total Descontos (Filtrado)</span>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(periodTotals.deductions)}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl border-b-emerald-500 border-b-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase">Custo Líquido (Filtrado)</span>
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(periodTotals.net)}</div>
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    {/* Filtro por Nome */}
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar funcionário..."
                            className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Filtro por Empresa */}
                    <select
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                    >
                        <option value="all">Todas as Empresas</option>
                        {companies.map(c => <option key={c as string} value={c as string}>{c as string}</option>)}
                    </select>

                    {/* Filtro por Loja */}
                    <select
                        className="block w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedStore}
                        onChange={(e) => setSelectedStore(e.target.value)}
                    >
                        <option value="all">Todas as Lojas</option>
                        {stores.map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
                    </select>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-2">
                    <span className="text-xs font-semibold text-slate-400">
                        Mostrando {filteredPayslips.length} de {payslips.length} holerites
                    </span>
                    <div className="flex items-center space-x-2">
                        <Button
                            onClick={async () => {
                                if (!confirm('Enviar e-mail para TODOS os funcionários filtrados?')) return;
                                const { sendAllPayslips } = await import('../actions/batch-email');
                                const res = await sendAllPayslips(periodId);
                                if (res.success) toast.success(res.message);
                                else toast.error(res.error);
                            }}
                            disabled={loading || status === 'CLOSED' || filteredPayslips.length === 0}
                            variant="outline"
                            size="sm"
                        >
                            <Mail className="mr-2 h-4 w-4 text-slate-500" />
                            Enviar E-mails
                        </Button>
                        <Button
                            onClick={handleCalculateAll}
                            disabled={loading || status === 'CLOSED'}
                            size="sm"
                            className="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 shadow-sm"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
                            Recalcular Filtrados
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-slate-500">Colaborador</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Bruto</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Descontos</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Líquido</th>
                            <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                            <th className="px-6 py-4 font-semibold text-slate-500 text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredPayslips.map((payslip) => (
                            <tr key={payslip.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800 dark:text-slate-100">{payslip.employee.name}</div>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                        <span className="text-[10px] text-slate-400 uppercase tracking-tighter">{payslip.employee.jobTitle}</span>
                                        {payslip.items.some((i: any) => i.source === 'SYNC') && (
                                            <Badge variant="outline" className="h-4 px-1 text-[8px] border-amber-200 text-amber-600 bg-amber-50">SYNC PONTO</Badge>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                    {formatCurrency(payslip.grossSalary)}
                                </td>
                                <td className="px-6 py-4 text-red-500 dark:text-red-400 font-medium">
                                    {formatCurrency(payslip.totalDeductions)}
                                </td>
                                <td className="px-6 py-4 font-extrabold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(payslip.netSalary)}
                                </td>
                                <td className="px-6 py-4">
                                    {payslip.status === 'CALCULATED' ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 uppercase">Processado</span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-50 text-slate-400 border border-slate-100 uppercase italic">Pendente</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={() => setViewPayslip(payslip)}
                                            title="Visualizar"
                                        >
                                            <Eye className="h-4 w-4 text-slate-400 hover:text-indigo-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            disabled={status === 'CLOSED'}
                                            onClick={() => setEditingPayslip(payslip)}
                                            title="Editar"
                                        >
                                            <Pencil className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                                        </Button>
                                        <Link href={`/print/payroll/${payslip.id}`} target="_blank">
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Imprimir">
                                                <Printer className="h-4 w-4 text-slate-400 hover:text-slate-900" />
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={async () => {
                                                if (!confirm(`Enviar por e-mail para ${payslip.employee.name}?`)) return;
                                                const res = await sendPayslipByEmail(payslip.id);
                                                if (res.success) toast.success(res.message);
                                                else toast.error(res.error);
                                            }}
                                            title="E-mail"
                                        >
                                            <Mail className="h-4 w-4 text-slate-400 hover:text-orange-500" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            disabled={calculatingId === payslip.employeeId || status === 'CLOSED'}
                                            onClick={() => handleCalculateSingle(payslip.employeeId)}
                                            title="Recalcular"
                                        >
                                            {calculatingId === payslip.employeeId ? (
                                                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                            ) : (
                                                <Calculator className="h-4 w-4 text-slate-400 hover:text-indigo-600" />
                                            )}
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredPayslips.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                                    {search ? 'Nenhum funcionário encontrado para esta busca.' : 'Nenhum holerite processado.'}
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

            {viewPayslip && (
                <PayslipViewModal
                    isOpen={!!viewPayslip}
                    onClose={() => setViewPayslip(null)}
                    payslip={viewPayslip}
                />
            )}
        </div>
    );
}
