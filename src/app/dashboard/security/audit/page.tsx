'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Search, Filter, Clock, User, HardDrive, ArrowLeft, Loader2, Calendar, FileText, Activity } from 'lucide-react';
import { getAuditLogsAction, getAuditSummaryAction } from '@/modules/configuration/actions/audit';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SecurityAuditPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const loadData = async () => {
        setLoading(true);
        const [logsRes, summaryRes] = await Promise.all([
            getAuditLogsAction({ page }),
            getAuditSummaryAction()
        ]);

        if (logsRes.success && logsRes.data) {
            setLogs(logsRes.data.logs);
            setTotalPages(logsRes.data.totalPages);
        }
        if (summaryRes.success) {
            setSummary(summaryRes.data);
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [page]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'UPDATE': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'DELETE': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-white/5 border-white/10';
        }
    };

    if (loading && page === 1) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
            <ShieldAlert className="h-14 w-14 animate-pulse text-brand-orange" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Auditando Trilhas de Segurança...</p>
        </div>
    );

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-8 bg-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em]">Compliance & Governança</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Painel de <span className="text-slate-500 underline decoration-brand-orange/30 underline-offset-8">Auditoria</span></h2>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-xl flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Activity className="h-6 w-6 text-brand-orange" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ações / 24h</p>
                            <p className="text-xl font-black text-white tracking-tight">{summary?.last24h || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-surface border border-border rounded-[48px] overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 blur-[120px] pointer-events-none" />

                <div className="p-8 border-b border-border flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                            <FileText className="h-5 w-5 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-[1000] text-white uppercase tracking-widest">Trilha de Eventos</h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Filtrar eventos..."
                                className="h-12 pl-12 pr-6 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold text-white focus:border-brand-orange outline-none transition-all w-64"
                            />
                        </div>
                        <button className="h-12 w-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
                            <Filter className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.02]">
                                <th className="px-8 py-6 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Data / Hora</th>
                                <th className="px-8 py-6 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Responsável</th>
                                <th className="px-8 py-6 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Módulo / Recurso</th>
                                <th className="px-8 py-6 text-left text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Ação</th>
                                <th className="px-8 py-6 text-left text-[9px) font-black text-slate-500 uppercase tracking-[0.2em]">ID do Recurso</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log: any) => (
                                <tr key={log.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <Clock className="h-3.5 w-3.5 text-slate-600" />
                                            <span className="text-[11px] font-bold text-slate-300 uppercase">
                                                {format(new Date(log.timestamp), "dd/MM/yy 'às' HH:mm", { locale: ptBR })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center">
                                                <User className="h-4 w-4 text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-black text-white uppercase tracking-tight">{log.user?.name || 'Sistema'}</p>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{log.user?.role || 'SYSTEM'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[8px] font-black text-slate-400 uppercase tracking-widest">{log.module}</span>
                                            <span className="text-slate-600">/</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">{log.resource}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border",
                                            getActionColor(log.action)
                                        )}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-[10px] font-mono text-slate-600 uppercase tracking-tighter">
                                        {log.resourceId?.substring(0, 13)}...
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 border-t border-border flex items-center justify-between bg-white/[0.01]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Exibindo {logs.length} de {summary?.totalCount || 0} registros</p>

                    <div className="flex items-center gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="h-10 px-6 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-white/10"
                        >
                            Anterior
                        </button>
                        <div className="h-10 px-4 flex items-center justify-center bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-[10px] font-black text-brand-orange uppercase italic">
                            Página {page}
                        </div>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(page + 1)}
                            className="h-10 px-6 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black text-white uppercase tracking-widest disabled:opacity-30 transition-all hover:bg-white/10"
                        >
                            Próxima
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
