'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { getAuditLogs } from '@/modules/core/actions/audit';

interface Log {
    id: string;
    action: string;
    resource: string;
    details: string | null;
    ipAddress: string | null;
    timestamp: Date;
    user: {
        name: string | null;
        email: string | null;
    } | null;
}

import { motion } from 'framer-motion';

export function AuditLogViewer() {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        const result = await getAuditLogs();
        if (result.success && result.data) {
            setLogs(result.data);
        }
        setLoading(false);
    };

    const getActionStyle = (action: string) => {
        if (action.includes('DELETE')) return 'bg-red-500/10 text-red-500 border-red-500/20';
        if (action.includes('CREATE')) return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        if (action.includes('UPDATE')) return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    if (loading) return (
        <div className="space-y-4">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />
            ))}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-2 px-2">
                <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Rastro de <span className="text-brand-orange">Operações</span></h3>
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Histórico Blindado de Ações do Sistema</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-emerald-500/80 uppercase tracking-widest">Monitoramento Ativo</span>
                </div>
            </div>

            <div className="bg-[#0A0F1C]/40 backdrop-blur-xl border border-white/5 rounded-[2rem] overflow-hidden">
                <div className="p-4 bg-white/[0.02] border-b border-white/5 grid grid-cols-12 gap-4 text-[9px] font-black text-slate-500 uppercase tracking-widest px-8">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-3">Operador</div>
                    <div className="col-span-2 text-center">Ação</div>
                    <div className="col-span-2">Recurso</div>
                    <div className="col-span-3 text-right">Diferencial / Payload</div>
                </div>

                <div className="divide-y divide-white/[0.02]">
                    {logs.map((log, i) => (
                        <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="grid grid-cols-12 gap-4 px-8 py-4 items-center hover:bg-white/[0.01] transition-colors group"
                        >
                            <div className="col-span-2">
                                <div className="text-[11px] font-black text-white tracking-tighter">
                                    {format(new Date(log.timestamp), "dd MMM, yy", { locale: ptBR })}
                                </div>
                                <div className="text-[9px] font-bold text-slate-600 uppercase">
                                    {format(new Date(log.timestamp), "HH:mm:ss", { locale: ptBR })}
                                </div>
                            </div>

                            <div className="col-span-3 flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:text-brand-orange group-hover:bg-brand-orange/10 transition-all border border-white/5">
                                    {log.user?.name?.charAt(0) || 'S'}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-black text-white truncate">{log.user?.name || 'SISTEMA'}</div>
                                    <div className="text-[8px] font-bold text-slate-600 truncate uppercase tracking-tighter">{log.user?.email || 'AUTO-RUN'}</div>
                                </div>
                            </div>

                            <div className="col-span-2 text-center">
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getActionStyle(log.action)}`}>
                                    {log.action}
                                </span>
                            </div>

                            <div className="col-span-2">
                                <span className="text-[10px] font-black text-indigo-400 font-mono bg-indigo-500/5 px-2 py-1 rounded-md border border-indigo-500/10">
                                    {log.resource}
                                </span>
                            </div>

                            <div className="col-span-3 text-right">
                                <div className="text-[10px] text-slate-500 font-medium truncate group-hover:text-slate-300 transition-colors" title={log.details || ''}>
                                    {log.details || 'Sem detalhes técnicos'}
                                </div>
                                {log.ipAddress && (
                                    <div className="text-[8px] font-bold text-slate-700 uppercase tracking-tighter mt-0.5">Origin: {log.ipAddress}</div>
                                )}
                            </div>
                        </motion.div>
                    ))}

                    {logs.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Vazio. Nenhuma atividade registrada no período.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
