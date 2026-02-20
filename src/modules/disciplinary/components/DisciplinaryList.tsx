'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Printer, Eye } from 'lucide-react';
import Link from 'next/link';
import { DisciplinaryDetailModal } from './DisciplinaryDetailModal';
import { DisciplinaryForm } from './DisciplinaryForm';
import { deleteDisciplinaryRecord } from '../actions/records';
import { toast } from 'sonner';

interface DisciplinaryListProps {
    records: any[];
    employees: any[];
}

export function DisciplinaryList({ records, employees }: DisciplinaryListProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);

    const filteredRecords = records.filter(rec =>
        rec.employee?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rec.reason.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRowClick = (record: any) => {
        setSelectedRecord(record);
        setIsDetailOpen(true);
    };

    const handleEdit = (record: any) => {
        setEditingRecord(record);
        setIsEditOpen(true);
        setIsDetailOpen(false);
    };

    const handleDelete = async (id: string) => {
        const res = await deleteDisciplinaryRecord(id);
        if (res.success) {
            toast.success('Ocorrência excluída com sucesso.');
        } else {
            toast.error('Erro ao excluir ocorrência.');
        }
    };

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
        <div className="space-y-4">
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
                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredRecords.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
                            {records.length === 0 ? 'Nenhuma ocorrência registrada.' : 'Nenhum resultado encontrado.'}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/5 uppercase text-xs">
                                    <tr>
                                        <th className="px-4 py-4 font-black">Data</th>
                                        <th className="px-4 py-4 font-black">Colaborador</th>
                                        <th className="px-4 py-4 font-black">Tipo</th>
                                        <th className="px-4 py-3 font-black">Gravidade</th>
                                        <th className="px-4 py-3 font-black">Motivo</th>
                                        <th className="px-4 py-3 font-black text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredRecords.map((rec) => (
                                        <tr
                                            key={rec.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all cursor-pointer group"
                                            onClick={() => handleRowClick(rec)}
                                        >
                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium">
                                                {format(new Date(rec.date), 'dd/MM/yyyy', { locale: ptBR })}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{rec.employee?.name}</div>
                                                <div className="text-[10px] text-slate-400 font-black uppercase tracking-wider">{rec.employee?.department}</div>
                                            </td>
                                            <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                                                <div className="flex items-center gap-2 font-semibold text-xs">
                                                    {getTypeLabel(rec.type)}
                                                    {rec.type === 'SUSPENSION' && rec.daysSuspended > 0 && (
                                                        <Badge variant="destructive" className="h-4 text-[9px] px-1 font-black">
                                                            {rec.daysSuspended}D
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                {getSeverityBadge(rec.severity)}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600 dark:text-slate-400 font-medium max-w-[200px] truncate">
                                                {rec.reason}
                                            </td>
                                            <td className="px-4 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex justify-end space-x-1 items-center">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                        title="Ver Detalhes"
                                                        onClick={() => handleRowClick(rec)}
                                                    >
                                                        <Eye className="h-4 w-4 text-slate-400 group-hover:text-blue-500" />
                                                    </Button>
                                                    <Link href={`/print/disciplinary/${rec.id}`} target="_blank">
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="Imprimir para Assinatura">
                                                            <Printer className="h-4 w-4 text-slate-400 hover:text-slate-800" />
                                                        </Button>
                                                    </Link>
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

            {/* Modal de Detalhes */}
            <DisciplinaryDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                record={selectedRecord}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Formulário de Edição (Controlado) */}
            {isEditOpen && (
                <DisciplinaryForm
                    isOpen={isEditOpen}
                    onOpenChange={setIsEditOpen}
                    employees={employees}
                    initialData={editingRecord}
                    onSuccess={() => {
                        setIsEditOpen(false);
                        setEditingRecord(null);
                    }}
                />
            )}
        </div>
    );
}
