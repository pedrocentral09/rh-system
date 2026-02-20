
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPayrollCostTrend, getCostByDepartment } from '../actions/analytics';
import { Loader2 } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function PayrollFinancialCharts({ periodId }: { periodId?: string }) {
    const [trend, setTrend] = useState<any[]>([]);
    const [deptDistro, setDeptDistro] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function load() {
            setLoading(true);
            const trendRes = await getPayrollCostTrend();
            if (trendRes.success) setTrend(trendRes.data || []);

            if (periodId) {
                const deptRes = await getCostByDepartment(periodId);
                if (deptRes.success) setDeptDistro(deptRes.data || []);
            }
            setLoading(false);
        }
        load();
    }, [periodId]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumSignificantDigits: 3 }).format(val);

    if (!mounted) return null;
    if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Evolução do Custo (Bruto)</CardTitle>
                    <CardDescription>Ultimas 6 competências</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={trend}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} tickFormatter={(val) => `R$${val / 1000}k`} />
                            <Tooltip formatter={(value: any) => [formatCurrency(value), 'Custo'] as any} />
                            <Bar dataKey="cost" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {periodId && (
                <Card>
                    <CardHeader>
                        <CardTitle>Custo por Departamento</CardTitle>
                        <CardDescription>Distribuição nesta competência</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={deptDistro}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    paddingAngle={5}
                                >
                                    {deptDistro.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: any) => [formatCurrency(value), 'Custo'] as any} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-2 justify-center mt-2 text-xs text-slate-500">
                            {deptDistro.map((entry, index) => (
                                <div key={entry.name} className="flex items-center">
                                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
