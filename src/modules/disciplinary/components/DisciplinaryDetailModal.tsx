'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/shared/components/ui/badge';
import { Printer, Edit, Trash2, Calendar, User, FileText, AlertTriangle, Paperclip } from 'lucide-react';
import Link from 'next/link';

interface DisciplinaryDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    record: any;
    onEdit: (record: any) => void;
    onDelete: (id: string) => void;
}

export function DisciplinaryDetailModal({ isOpen, onClose, record, onEdit, onDelete }: DisciplinaryDetailModalProps) {
    if (!record) return null;

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
            case 'FEEDBACK': return 'Feedback Orientativo';
            default: return type;
        }
    };

    const documents = JSON.parse(record.documents || '[]');

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Detalhes da Ocorrência"
            width="2xl"
        >
            <div className="space-y-6">
                {/* Header Information */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <User className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-none mb-1">
                                {record.employee?.name}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                {record.employee?.jobTitle} • {record.employee?.department}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Status em Folha</div>
                        <Badge variant={record.payrollStatus === 'PENDING' ? 'destructive' : 'secondary'} className="uppercase text-[10px] font-black">
                            {record.payrollStatus === 'PENDING' ? 'Pendente' : 'Processado/NI'}
                        </Badge>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data do Ocorrido</span>
                        </div>
                        <div className="font-bold text-slate-800 dark:text-zinc-100">
                            {format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo e Gravidade</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 dark:text-zinc-100">{getTypeLabel(record.type)}</span>
                            {getSeverityBadge(record.severity)}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Motivo</span>
                        </div>
                        <div className="font-black text-slate-900 dark:text-white text-lg leading-tight italic border-l-4 border-red-500 pl-4 py-1">
                            "{record.reason}"
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição Completa</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl text-sm leading-relaxed text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800">
                            {record.description}
                        </div>
                    </div>

                    {record.type === 'SUSPENSION' && (
                        <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                <div>
                                    <div className="text-xs font-black text-red-800 dark:text-red-400 uppercase">Suspensão de Trabalho</div>
                                    <div className="text-sm font-medium text-red-700 dark:text-red-300">Total de {record.daysSuspended} dias de desconto.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {documents.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-4 w-4 text-slate-400" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidências e Anexos</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {documents.map((doc: any, i: number) => (
                                    <a
                                        key={i}
                                        href={doc.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors shadow-sm"
                                    >
                                        <Paperclip className="h-3 w-3" />
                                        {doc.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="bg-red-50 border-red-100 text-red-600 hover:bg-red-100 hover:text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400"
                            onClick={() => {
                                if (confirm('Deseja realmente excluir este registro permanentemente?')) {
                                    onDelete(record.id);
                                    onClose();
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                        </Button>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href={`/print/disciplinary/${record.id}`} target="_blank">
                            <Button variant="outline" className="border-slate-200 dark:border-slate-800 font-bold">
                                <Printer className="h-4 w-4 mr-2 text-slate-400" />
                                Gerar Documento
                            </Button>
                        </Link>
                        <Button
                            className="bg-[#001B3D] hover:bg-[#002b5d] dark:bg-zinc-100 dark:hover:bg-white dark:text-black text-white font-bold"
                            onClick={() => onEdit(record)}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Editar Registro
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
