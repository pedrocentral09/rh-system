'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Printer } from 'lucide-react';
import Link from 'next/link';

interface DisciplinaryListProps {
    records: any[];
}

export function DisciplinaryList({ records }: DisciplinaryListProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredRecords = records.filter(rec =>
        rec.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'LOW': return <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">Leve</Badge>;
            case 'MEDIUM': return <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800">Média</Badge>;
            case 'HIGH': return <Badge variant="outline" className="border-orange-500 text-orange-700 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800">Grave</Badge>;
            case 'CRITICAL': return <Badge variant="destructive" className="dark:bg-red-900/50 dark:text-red-300 dark:border-red-800">Crítica</Badge>;
            default: return <Badge variant="secondary">{severity}</Badge>;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'VERBAL_WARNING': return 'Advertência Verbal';
            case 'WRITTEN_WARNING': return 'Advertência Escrita';
            case 'SUSPENSION': return 'Suspensão';
            case 'FEEDBACK': return 'Feedback';
            default: return type;
        }
    };

    return (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Histórico de Ocorrências</CardTitle>
                    <CardDescription>Registro de advertências, suspensões e feedbacks.</CardDescription>
                </div>
                <div className="w-1/3">
                    <Input
                        placeholder="Buscar por colaborador..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-50"
                    />
                </div>
            </CardHeader>
            <CardContent>
                {filteredRecords.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                        {records.length === 0 ? 'Nenhuma ocorrência registrada.' : 'Nenhum resultado encontrado.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3">Colaborador</th>
                                    <th className="px-4 py-3">Tipo</th>
                                    <th className="px-4 py-3">Gravidade</th>
                                    <th className="px-4 py-3">Motivo</th>
                                    <th className="px-4 py-3">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredRecords.map((rec) => (
                                    <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                            {format(new Date(rec.date), 'dd/MM/yy', { locale: ptBR })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 dark:text-white">{rec.employee?.name}</div>
                                            <div className="text-xs text-slate-500">{rec.employee?.department}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                                            {getTypeLabel(rec.type)}
                                            {rec.type === 'SUSPENSION' && rec.daysSuspended > 0 && (
                                                <span className="text-xs text-red-500 ml-1">({rec.daysSuspended} dias)</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {getSeverityBadge(rec.severity)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                            {rec.reason}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex space-x-2 items-center">
                                                <Link href={`/print/disciplinary/${rec.id}`} target="_blank">
                                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Imprimir Documento">
                                                        <Printer className="h-4 w-4 text-slate-400 hover:text-slate-800" />
                                                    </Button>
                                                </Link>
                                                {rec.documents && JSON.parse(rec.documents || '[]').length > 0 && (
                                                    <a
                                                        href={JSON.parse(rec.documents)[0].url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                                        title="Ver Evidência"
                                                    >
                                                        📎 Prova
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
