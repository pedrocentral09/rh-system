'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Loader2, Search, FileBarChart2, Users, AlertCircle, Download, Activity, Filter, Calendar, Plus } from 'lucide-react';
import { getAllMedicalLeaves } from '@/modules/personnel/actions/medical-leave';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { formatSafeDate } from '@/shared/utils/date-utils';

import { MedicalLeaveCreateModal } from './MedicalLeaveCreateModal';

export function MedicalDashboard() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        const res = await getAllMedicalLeaves();
        if (res.success) {
            setLeaves(res.data || []);
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    }

    const filteredLeaves = leaves.filter(l =>
        l.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.cid && l.cid.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Stats Calculation
    const topCids = leaves.reduce((acc: any, curr) => {
        if (curr.cid) {
            acc[curr.cid] = (acc[curr.cid] || 0) + 1;
        }
        return acc;
    }, {});

    const sortedCids = Object.entries(topCids)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);

    const topEmployees = leaves.reduce((acc: any, curr) => {
        acc[curr.employee.name] = (acc[curr.employee.name] || 0) + 1;
        return acc;
    }, {});

    const sortedEmployees = Object.entries(topEmployees)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5);

    const totalDays = leaves.reduce((sum, curr) => sum + (Number(curr.daysCount) || 0), 0);

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-10 w-10 text-indigo-600" /></div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-slate-500 tracking-widest">Total de Registros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">{leaves.length}</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Atestados e Licenças</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-red-500 tracking-widest">Dias de Afastamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-red-600 dark:text-red-400">{totalDays}</div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">Total acumulado</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-amber-500 tracking-widest">CID mais frequente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                            {sortedCids[0] ? String(sortedCids[0][0]) : 'N/A'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">
                            {sortedCids[0] ? String(sortedCids[0][1]) : '0'} ocorrências
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-xs font-black uppercase text-indigo-500 tracking-widest">Colaborador + Registros</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-black text-indigo-600 dark:text-indigo-400 truncate">
                            {sortedEmployees[0] ? String(sortedEmployees[0][0]) : 'N/A'}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase">
                            {sortedEmployees[0] ? String(sortedEmployees[0][1]) : '0'} atestados
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Buscar por colaborador, CID ou tipo..."
                                className="pl-10 bg-slate-50 dark:bg-slate-800 border-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
                        <Button onClick={() => setIsCreateModalOpen(true)} className="bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-tighter px-6">
                            <Plus className="h-4 w-4 mr-2" /> Incluir Afastamento
                        </Button>
                    </div>

                    <MedicalLeaveCreateModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={loadData}
                    />

                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Colaborador</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tipo / CID</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Período</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Dias</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Ação</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredLeaves.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-white dark:border-slate-700 shadow-sm">
                                                        {leave.employee.photoUrl ? (
                                                            <img src={leave.employee.photoUrl} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span className="flex items-center justify-center h-full w-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase">
                                                                {leave.employee.name.charAt(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{leave.employee.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase">{leave.type.replace('_', ' ')}</span>
                                                    {leave.cid && <span className="text-xs font-black text-red-500 tracking-tighter">CID: {leave.cid}</span>}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded flex items-center gap-1 w-fit">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatSafeDate(leave.startDate, 'dd/MM/yy')} → {formatSafeDate(leave.endDate, 'dd/MM/yy')}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{leave.daysCount}</span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={() => window.open(leave.documentUrl, '_blank')}
                                                >
                                                    <Download className="h-4 w-4 text-emerald-600" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Activity className="h-4 w-4 text-red-500" /> Top CIDs (Afastamentos)
                            </CardTitle>
                            <CardDescription className="text-xs">CIDs com maior incidência no período.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sortedCids.map(([cid, count]) => (
                                <div key={String(cid)} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">CID: {String(cid)}</span>
                                    <span className="text-xs font-black bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full">{String(count)} casos</span>
                                </div>
                            ))}
                            {sortedCids.length === 0 && <p className="text-xs text-slate-500 text-center py-4">Nenhum dado de CID disponível.</p>}
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                                <Users className="h-4 w-4 text-indigo-500" /> Recorrência por Colaborador
                            </CardTitle>
                            <CardDescription className="text-xs">Colaboradores com mais registros.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {sortedEmployees.map(([name, count]) => (
                                <div key={String(name)} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{String(name)}</span>
                                    <span className="text-xs font-black bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{String(count)} registros</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
