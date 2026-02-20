
'use client';

import { useEffect, useState } from 'react';
import { getRubricBreakdown } from '../actions/analytics';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Loader2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

export function RubricBreakdown({ periodId }: { periodId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getRubricBreakdown(periodId);
            if (res.success) setData(res.data || []);
            setLoading(false);
        }
        load();
    }, [periodId]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    const earnings = data.filter(i => i.type === 'EARNING');
    const deductions = data.filter(i => i.type === 'DEDUCTION');

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Proventos */}
            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950">
                <CardHeader className="bg-emerald-50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/50">
                    <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center text-lg">
                        <ArrowUpCircle className="mr-2 h-5 w-5" /> Detalhe de Proventos
                    </CardTitle>
                    <CardDescription>Total acumulado por rubrica nesta folha</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left">Cód</th>
                                <th className="px-4 py-3 text-left">Rubrica</th>
                                <th className="px-4 py-3 text-right">Total Acumulado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                            {earnings.map(item => (
                                <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-400 text-xs">{item.code}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{item.name}</td>
                                    <td className="px-4 py-3 text-right font-black text-emerald-600">{formatCurrency(item.value)}</td>
                                </tr>
                            ))}
                            {earnings.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Sem proventos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Descontos */}
            <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950">
                <CardHeader className="bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-900/50">
                    <CardTitle className="text-red-700 dark:text-red-400 flex items-center text-lg">
                        <ArrowDownCircle className="mr-2 h-5 w-5" /> Detalhe de Descontos
                    </CardTitle>
                    <CardDescription>Total acumulado por rubrica nesta folha</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-100 dark:border-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left">Cód</th>
                                <th className="px-4 py-3 text-left">Rubrica</th>
                                <th className="px-4 py-3 text-right">Total Acumulado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                            {deductions.map(item => (
                                <tr key={item.code} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-4 py-3 font-bold text-slate-400 text-xs">{item.code}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{item.name}</td>
                                    <td className="px-4 py-3 text-right font-black text-red-600">{formatCurrency(item.value)}</td>
                                </tr>
                            ))}
                            {deductions.length === 0 && (
                                <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">Sem descontos registrados</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>
        </div>
    );
}
