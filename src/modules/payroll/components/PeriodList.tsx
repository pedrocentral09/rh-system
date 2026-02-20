
'use client';

import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

interface PeriodListProps {
    periods: any[];
}

interface PeriodListProps {
    periods: any[];
}

export function PeriodList({ periods }: PeriodListProps) {
    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (periods.length === 0) {
        return (
            <div className="p-12 text-center text-slate-500">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-lg font-medium">Nenhuma folha encontrada</h3>
                <p>Clique em "Nova Competência" para começar.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Competência</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Status</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Funcionários</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Total Bruto</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400">Total Líquido</th>
                        <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-right">Ação</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {periods.map((period) => (
                        <tr key={period.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                            <td className="px-6 py-4">
                                <span className="text-lg font-bold text-slate-900 dark:text-slate-100 italic">
                                    {period.month.toString().padStart(2, '0')}/{period.year}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                    ${period.status === 'OPEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                        period.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'}`}>
                                    {period.status === 'OPEN' ? '🟢 Aberto' : period.status === 'PAID' ? '💰 Pago' : period.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                <div className="flex items-center font-medium">
                                    <span className="text-slate-800 dark:text-slate-200 mr-1">{period._count.payslips}</span>
                                    holerites
                                </div>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-300">
                                {formatCurrency(period.totalGross || 0)}
                            </td>
                            <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                                {formatCurrency(period.totalNet || 0)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <Link href={`/dashboard/payroll/${period.id}`}>
                                    <Button size="sm" variant="outline" className="opacity-0 group-hover:opacity-100 transition-opacity border-indigo-200 text-indigo-600 hover:bg-indigo-50">
                                        Gerenciar
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
