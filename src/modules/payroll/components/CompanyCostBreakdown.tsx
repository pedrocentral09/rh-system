
'use client';

import { useEffect, useState } from 'react';
import { getCostByCompany } from '../actions/analytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Loader2, Building2 } from 'lucide-react';

export function CompanyCostBreakdown({ periodId }: { periodId: string }) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getCostByCompany(periodId);
            if (res.success) setData(res.data || []);
            setLoading(false);
        }
        load();
    }, [periodId]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <Card className="border-none shadow-md overflow-hidden bg-white dark:bg-slate-950">
            <CardHeader className="bg-indigo-50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/50">
                <CardTitle className="text-indigo-700 dark:text-indigo-400 flex items-center text-lg">
                    <Building2 className="mr-2 h-5 w-5" /> Custos por Empresa de Registro
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase font-black border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left">Empresa</th>
                            <th className="px-4 py-3 text-right">Custo Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-900">
                        {data.map(item => (
                            <tr key={item.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/30">
                                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{item.name}</td>
                                <td className="px-4 py-3 text-right font-black text-indigo-600">{formatCurrency(item.value)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
