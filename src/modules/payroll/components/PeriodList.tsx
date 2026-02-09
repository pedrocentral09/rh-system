
'use client';

import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

interface PeriodListProps {
    periods: any[];
}

export function PeriodList({ periods }: PeriodListProps) {
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
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                    <th className="px-6 py-4 font-medium text-slate-500">Competência</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Status</th>
                    <th className="px-6 py-4 font-medium text-slate-500">Holerites</th>
                    <th className="px-6 py-4 font-medium text-slate-500 text-right">Ação</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {periods.map((period) => (
                    <tr key={period.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                            {period.month.toString().padStart(2, '0')}/{period.year}
                        </td>
                        <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                ${period.status === 'OPEN' ? 'bg-blue-100 text-blue-800' :
                                    period.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                {period.status === 'OPEN' ? 'Aberto' : period.status === 'PAID' ? 'Pago' : period.status}
                            </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {period._count.payslips} processados
                        </td>
                        <td className="px-6 py-4 text-right">
                            <Link href={`/dashboard/payroll/${period.id}`}>
                                <Button size="sm" variant="outline">
                                    Gerenciar
                                </Button>
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
