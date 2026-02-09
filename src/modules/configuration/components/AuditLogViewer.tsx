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
        email: string;
    } | null;
}

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

    const getActionColor = (action: string) => {
        if (action.includes('DELETE')) return 'text-red-600 bg-red-50 border-red-200';
        if (action.includes('CREATE')) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
        if (action.includes('UPDATE')) return 'text-sky-600 bg-sky-50 border-sky-200';
        return 'text-slate-600 bg-slate-50 border-slate-200';
    };

    if (loading) return <div className="p-8 text-center text-slate-500 animate-pulse">Carregando auditoria...</div>;

    return (
        <Card className="border-slate-200 shadow-sm">
            <CardHeader>
                <CardTitle>📋 Logs de Auditoria</CardTitle>
                <CardDescription>Histórico de alterações críticas no sistema.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3">Data/Hora</th>
                                <th className="px-6 py-3">Usuário</th>
                                <th className="px-6 py-3">Ação</th>
                                <th className="px-6 py-3">Recurso</th>
                                <th className="px-6 py-3">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap">
                                        <div className="font-medium text-slate-900">
                                            {format(new Date(log.timestamp), "dd/MM/yyyy", { locale: ptBR })}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {format(new Date(log.timestamp), "HH:mm:ss", { locale: ptBR })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        {log.user ? (
                                            <div>
                                                <div className="text-slate-900 font-medium">{log.user.name || 'Sem Nome'}</div>
                                                <div className="text-xs text-slate-500">{log.user.email}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Sistema / Desconhecido</span>
                                        )}
                                        {log.ipAddress && <div className="text-[10px] text-slate-400 mt-1">IP: {log.ipAddress}</div>}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs text-slate-600">
                                        {log.resource}
                                    </td>
                                    <td className="px-6 py-3 max-w-xs truncate text-xs text-slate-500" title={log.details || ''}>
                                        {log.details || '-'}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-slate-400">
                                        Nenhum registro de auditoria encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
