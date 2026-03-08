'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { registerTransfer } from '../actions';
import { getStores } from '../../configuration/actions/stores';
import { toast } from 'sonner';

interface EmployeeTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: {
        id: string;
        name: string;
        contract?: {
            store?: {
                name: string;
            } | string;
        };
    };
    onSuccess: () => void;
}

import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Store, Calendar, FileText, ChevronRight, Loader2 } from 'lucide-react';

export default function EmployeeTransferModal({ isOpen, onClose, employee, onSuccess }: EmployeeTransferModalProps) {
    if (!employee) return null;

    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState<any[]>([]);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [newStoreId, setNewStoreId] = useState('');
    const [reason, setReason] = useState('Transferência');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadStores();
            // Reset form
            setDate(new Date().toISOString().split('T')[0]);
            setNewStoreId('');
            setReason('Transferência');
            setNotes('');
        }
    }, [isOpen]);

    const loadStores = async () => {
        try {
            const result = await getStores();
            if (result.success) {
                setStores(result.data || []);
            }
        } catch (error) {
            console.error("Failed to load stores:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await registerTransfer({
            employeeId: employee.id,
            date: new Date(date),
            newStoreId,
            reason,
            notes
        });

        if (result.success) {
            toast.success('Transferência realizada com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Erro ao realizar transferência');
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Logística de Capital Humano" width="4xl">
            <div className="bg-surface/95 backdrop-blur-2xl rounded-[2.5rem] p-0 overflow-hidden relative border border-border">
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <form onSubmit={handleSubmit} className="space-y-10 p-10 relative z-10">
                    {/* Header Context */}
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shadow-2xl">
                            <Truck className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Registro de Movimentação</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-80">Alteração de Lotação e Unidade Operacional</p>
                        </div>
                    </div>

                    {/* Employee Card Info */}
                    <div className="bg-surface-secondary border border-border rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 group hover:border-brand-blue/30 transition-all duration-500">
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center font-black text-text-primary uppercase">
                                {employee.name.charAt(0)}
                            </div>
                            <div>
                                <span className="text-[9px] font-black text-text-secondary uppercase tracking-widest block mb-1 opacity-80">Colaborador em Trânsito</span>
                                <p className="text-xl font-black text-text-primary uppercase tracking-tighter italic">{employee.name}</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-4 text-text-secondary">
                            <div className="text-right">
                                <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Lotação Atual</span>
                                <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">
                                    {typeof employee.contract?.store === 'object' ? employee.contract?.store?.name : (employee.contract?.store || 'NÃO DEFINIDA')}
                                </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-brand-blue" />
                            <div className="text-left">
                                <span className="text-[8px] font-black uppercase tracking-widest block opacity-70">Destino</span>
                                <p className="text-[10px] font-black text-brand-blue uppercase tracking-tight">
                                    {stores.find(s => s.id === newStoreId)?.name || 'AGUARDANDO...'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Efetivação do Movimento</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Unidade de Destino</label>
                            <div className="relative group">
                                <Store className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <select
                                    value={newStoreId}
                                    onChange={(e) => setNewStoreId(e.target.value)}
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner appearance-none cursor-pointer"
                                    required
                                >
                                    <option value="" className="bg-surface">SELECIONE A UNIDADE</option>
                                    {stores.map(store => {
                                        const currentStoreId = typeof employee.contract?.store === 'object' ? (employee.contract?.store as any)?.id : null;
                                        return (
                                            <option key={store.id} value={store.id} disabled={store.id === currentStoreId} className="bg-surface">
                                                {store.name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Fundamentação Estratégica / Motivo</label>
                            <div className="relative group">
                                <FileText className="absolute left-6 top-6 w-4 h-4 text-brand-blue pointer-events-none group-focus-within:text-text-primary transition-colors" />
                                <input
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="EX: EXPANSÃO DE UNIDADE, PROMOÇÃO..."
                                    className="w-full h-16 bg-surface-secondary border border-border rounded-2xl pl-14 pr-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-4">Observações Protocolares</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="DETALHES ADICIONAIS SOBRE A MOVIMENTAÇÃO..."
                                className="w-full h-32 bg-surface-secondary border border-border rounded-[2rem] p-8 text-[11px] font-black text-text-primary uppercase tracking-widest focus:outline-none focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner resize-none placeholder:text-text-secondary/40"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end items-center gap-6 pt-10 border-t border-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors"
                        >
                            Abortar Operação
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !newStoreId}
                            className="h-16 px-12 rounded-[1.25rem] bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-3 disabled:bg-surface-secondary disabled:text-text-secondary border-b-4 border-black/20"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
                            EFETIVAR MOVIMENTAÇÃO 🚀
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
