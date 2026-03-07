'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import { getPeopleAnalytics } from '../actions/analytics';
import { Loader2, TrendingUp, DollarSign, Target, Sparkles } from 'lucide-react';

export function PeopleAnalytics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPeopleAnalytics().then(res => {
            if (res.success) setData(res.data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Processando People Analytics...</p>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Turnover Trend */}
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/20 rounded-xl text-rose-500">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Tendência de Turnover</CardTitle>
                                <CardDescription className="text-slate-400">Taxa de desligamento nos últimos 6 meses</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.turnoverTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fb923c' }}
                                />
                                <Line type="monotone" dataKey="turnover" stroke="#f43f5e" strokeWidth={4} dot={{ fill: '#f43f5e', r: 6 }} activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Overtime Costs */}
                <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-500">
                                <DollarSign className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black uppercase tracking-tight">Custos de Extra (Lojas)</CardTitle>
                                <CardDescription className="text-slate-400">Impacto financeiro por unidade (Mês Atual)</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.storeOvertime}>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                                <Tooltip
                                    cursor={{ fill: '#ffffff05' }}
                                    contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                                />
                                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                                    {data.storeOvertime.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#34d399'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Nine-Box Matrix */}
            <Card className="border-none shadow-xl bg-slate-900 text-white rounded-[32px] overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-brand-orange/20 rounded-xl text-brand-orange">
                            <Target className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Matriz Nine-Box (Talentos)</CardTitle>
                            <CardDescription className="text-slate-400">Cruzamento de Desempenho vs. Potencial de Crescimento</CardDescription>
                        </div>
                    </div>
                    <div className="bg-brand-orange/10 border border-brand-orange/20 px-4 py-2 rounded-2xl flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase">IA Predictor Ativo</span>
                    </div>
                </CardHeader>
                <CardContent className="h-[400px] pt-8 relative">
                    {/* Background Labels */}
                    <div className="absolute inset-x-12 inset-y-12 border-l border-b border-white/10 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between w-full h-full">
                            <div className="flex-1 border-r border-white/5 flex flex-col items-center justify-center font-black text-[10px] text-slate-700 uppercase tracking-widest">Baixo Potencial</div>
                            <div className="flex-1 border-r border-white/5 flex flex-col items-center justify-center font-black text-[10px] text-brand-orange/30 uppercase tracking-widest bg-brand-orange/5">High Potential</div>
                            <div className="flex-1 flex flex-col items-center justify-center font-black text-[10px] text-emerald-400/40 uppercase tracking-widest bg-emerald-400/5">Top Talents</div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                            <XAxis type="number" dataKey="x" name="Desempenho" domain={[0, 5]} stroke="#94a3b8" label={{ value: 'Desempenho (Avaliações)', position: 'bottom', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <YAxis type="number" dataKey="y" name="Potencial" domain={[0, 5]} stroke="#94a3b8" label={{ value: 'Potencial', angle: -90, position: 'left', fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                            <ZAxis type="number" range={[100, 400]} />
                            <Tooltip
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}
                            />
                            <Scatter name="Colaboradores" data={data.nineBox} fill="#fb923c">
                                {data.nineBox.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.x > 4 && entry.y > 4 ? '#10b981' : '#fb923c'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
