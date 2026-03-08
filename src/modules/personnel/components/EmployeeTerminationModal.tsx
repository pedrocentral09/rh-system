'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { terminateEmployee } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getTerminationReasons } from '@/modules/configuration/actions/auxiliary';
import { useEffect } from 'react';

import { motion } from 'framer-motion';
import { UserX, Calendar, FileText, AlertTriangle, ChevronRight } from 'lucide-react';

interface EmployeeTerminationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
    onSuccess: () => void;
}

export function EmployeeTerminationModal({ isOpen, onClose, employee, onSuccess }: EmployeeTerminationModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [reasonId, setReasonId] = useState('');
    const [reasonsList, setReasonsList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadReasons = async () => {
            const res = await getTerminationReasons();
            if (res.success) setReasonsList(res.data || []);
        };
        loadReasons();
    }, []);

    if (!employee) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!date || !reason) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }

        if (!confirm(`Confirma o desligamento de ${employee.name}?`)) return;

        setLoading(true);
        const result = await terminateEmployee(employee.id, new Date(date), reason, reasonId);
        setLoading(false);

        if (result.success) {
            toast.success('Colaborador desligado com sucesso.');
            onSuccess();
        } else {
            toast.error(result.error || 'Erro ao desligar colaborador.');
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} hideHeader width="xl">
            <div className="bg-surface/95 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden relative border border-border">
                <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10 p-10 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-2xl">
                            <UserX className="h-8 w-8 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Protocolo de Desligamento</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-80">Rescisão de Contrato e Inativação</p>
                        </div>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-start gap-4 shadow-inner group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0 animate-pulse" />
                        <p className="text-[11px] font-bold text-rose-500 leading-relaxed uppercase tracking-wider">
                            Atenção: Esta é uma operação crítica. Ao confirmar, o contrato de <span className="text-rose-500 font-black">{employee.name}</span> será encerrado e o acesso ao portal revogado.
                        </p>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4 italic">Efetivação de Saída</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-rose-500/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4 italic">Motivador Rescisório</label>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500 pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <select
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-rose-500/50 focus:bg-surface transition-all shadow-inner appearance-none cursor-pointer"
                                    value={reasonId}
                                    onChange={(e) => {
                                        setReasonId(e.target.value);
                                        const selected = reasonsList.find(r => r.id === e.target.value);
                                        if (selected && !reason) setReason(selected.name);
                                    }}
                                    required
                                >
                                    <option value="" className="bg-surface">SELECIONE O MOTIVO</option>
                                    {reasonsList.map(r => (
                                        <option key={r.id} value={r.id} className="bg-surface">{r.name.toUpperCase()}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4 italic">Justificativa / Observações</label>
                            <textarea
                                className="w-full h-32 bg-surface-secondary border border-border rounded-[2rem] p-8 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-rose-500/50 focus:bg-surface transition-all shadow-inner resize-none placeholder:text-text-muted/40"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="EX: SOLICITAÇÃO DO COLABORADOR, REESTRUTURAÇÃO..."
                            />
                        </div>
                    </div>

                    <div className="flex justify-end items-center gap-8 pt-10 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors"
                        >
                            Abortar Protocolo
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="h-16 px-12 rounded-[1.25rem] bg-rose-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-500 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-rose-500/20 flex items-center justify-center gap-3 border-b-4 border-black/20"
                        >
                            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            EFETIVAR DESLIGAMENTO 🚫
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
