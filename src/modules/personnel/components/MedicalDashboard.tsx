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

import { motion } from 'framer-motion';

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

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="animate-spin h-10 w-10 text-brand-orange" />
            <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest opacity-80">Sincronizando Registros Médicos...</span>
        </div>
    );

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Health Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: 'Ocorrências Totais', value: leaves.length, sub: 'Atestados & Licenças', color: 'text-text-primary', bg: 'bg-surface', icon: '📋' },
                    { label: 'Dias de Ausência', value: totalDays, sub: 'Acumulado Geral', color: 'text-red-500', bg: 'bg-surface', icon: '⏳' },
                    { label: 'CID Predominante', value: sortedCids[0] ? String(sortedCids[0][0]) : 'N/A', sub: `${sortedCids[0] ? String(sortedCids[0][1]) : '0'} incidências`, color: 'text-amber-500', bg: 'bg-surface', icon: '🧠' },
                    { label: 'Frequência Máxima', value: sortedEmployees[0] ? String(sortedEmployees[0][0]) : 'N/A', sub: `${sortedEmployees[0] ? String(sortedEmployees[0][1]) : '0'} registros`, color: 'text-brand-blue', bg: 'bg-surface', icon: '👤' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${stat.bg} backdrop-blur-xl border border-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-text-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-text-primary/10 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">{stat.icon}</span>
                            <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-80">{stat.label}</span>
                        </div>
                        <div className={`text-2xl font-black tracking-tighter truncate ${stat.color}`}>
                            {stat.value}
                        </div>
                        <p className="text-[8px] font-black uppercase text-text-secondary/60 mt-2 tracking-widest">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Content Area */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Premium Control Bar */}
                    <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary group-focus-within:text-brand-orange transition-colors" />
                            <input
                                placeholder="PESQUISAR POR COLABORADOR OU CID..."
                                className="w-full bg-text-primary/5 border border-border rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black text-text-primary uppercase tracking-widest placeholder:text-text-secondary/40 focus:outline-none focus:border-brand-orange/30 transition-all shadow-inner"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full md:w-auto h-14 px-8 rounded-2xl bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-[0_0_30px_rgba(239,68,68,0.2)] flex items-center justify-center gap-3 group"
                        >
                            <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                            Incluir Afastamento
                        </button>
                    </div>

                    <MedicalLeaveCreateModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onSuccess={loadData}
                    />

                    {/* Premium List Table */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-80">
                            <div className="col-span-5 text-left text-brand-orange/60">Colaborador / Identidade</div>
                            <div className="col-span-3 text-center">Referência / CID</div>
                            <div className="col-span-2 text-center">Dias</div>
                            <div className="col-span-2 text-right">Controle</div>
                        </div>

                        <div className="space-y-3">
                            {filteredLeaves.map((leave, i) => (
                                <motion.div
                                    key={leave.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className="bg-surface/80 border border-border rounded-[1.5rem] px-8 py-5 grid grid-cols-12 items-center hover:border-red-500/30 hover:bg-text-primary/[0.02] transition-all duration-300 group"
                                >
                                    <div className="col-span-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-text-primary/5 border border-border flex items-center justify-center text-xl shadow-inner group-hover:border-red-500/30 transition-colors overflow-hidden">
                                            {leave.employee.photoUrl ? (
                                                <img src={leave.employee.photoUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-text-secondary font-black">{leave.employee.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-[13px] font-black text-text-primary uppercase tracking-tight group-hover:text-red-400 transition-colors truncate">{leave.employee.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Calendar className="h-3 w-3 text-text-secondary/60" />
                                                <span className="text-[9px] font-bold text-text-secondary/60 uppercase tracking-widest">
                                                    {formatSafeDate(leave.startDate, 'dd.MM')} → {formatSafeDate(leave.endDate, 'dd.MM.yy')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-3 text-center">
                                        <div className="flex flex-col gap-1 items-center">
                                            <span className="bg-text-primary/5 text-text-secondary px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border border-border opacity-80">{leave.type.replace('_', ' ')}</span>
                                            {leave.cid && <span className="text-xs font-black text-red-500/80 tracking-tighter">CID {leave.cid}</span>}
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-center">
                                        <div className="bg-red-500/5 px-4 py-1.5 rounded-xl border border-red-500/10 inline-block">
                                            <span className="text-sm font-black text-red-400">{leave.daysCount}d</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button
                                            onClick={() => window.open(leave.documentUrl, '_blank')}
                                            className="w-10 h-10 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-text-primary/10 transition-all shadow-lg active:scale-95"
                                            title="Baixar Comprovante"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}

                            {filteredLeaves.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-24 text-text-secondary bg-text-primary/5 rounded-[2.5rem] border border-border border-dashed">
                                    <Activity className="h-12 w-12 mb-6 opacity-10" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] italic opacity-80">Nenhum evento médico localizado</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lateral Analytics */}
                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-8 shadow-2xl space-y-8"
                    >
                        <div className="space-y-1">
                            <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-4 w-4 text-red-500" />
                                Top CIDs / Impacto
                            </h3>
                            <p className="text-[10px] text-text-secondary font-bold uppercase opacity-80">Maiores incidências clínicas</p>
                        </div>

                        <div className="space-y-4">
                            {sortedCids.map(([cid, count], i) => (
                                <div key={String(cid)} className="group relative">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-text-secondary uppercase tracking-tighter opacity-80">CID: {String(cid)}</span>
                                        <span className="text-[10px] font-black text-red-400 uppercase tracking-tighter">{String(count)} ocorrências</span>
                                    </div>
                                    <div className="h-1.5 bg-text-primary/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(Number(count) / (leaves.length || 1)) * 100}%` }}
                                            transition={{ duration: 1 + i * 0.2 }}
                                            className="h-full bg-red-500/40 rounded-full"
                                        />
                                    </div>
                                </div>
                            ))}
                            {sortedCids.length === 0 && <div className="text-center py-8 text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] italic opacity-60">Nenhum dado disponível</div>}
                        </div>

                        <div className="pt-8 border-t border-border space-y-6">
                            <div className="space-y-1">
                                <h3 className="text-xs font-black text-text-primary uppercase tracking-widest flex items-center gap-2">
                                    <Users className="h-4 w-4 text-brand-blue" />
                                    Recorrência Colaborador
                                </h3>
                            </div>

                            <div className="space-y-3">
                                {sortedEmployees.map(([name, count]) => (
                                    <div key={String(name)} className="flex items-center justify-between p-4 rounded-2xl bg-text-primary/5 border border-border hover:bg-text-primary/[0.08] transition-colors cursor-default">
                                        <span className="text-[11px] font-black text-text-secondary uppercase tracking-tight truncate max-w-[180px]">{String(name)}</span>
                                        <div className="bg-brand-blue/10 px-2 py-1 rounded-lg border border-brand-blue/20 text-[9px] font-black text-brand-blue">
                                            {String(count)} atestados
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
