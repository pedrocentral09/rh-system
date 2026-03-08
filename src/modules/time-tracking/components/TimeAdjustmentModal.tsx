'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { adjustTimeRecords } from '@/modules/time-tracking/actions/timesheet';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TimeAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
    date: string;
    currentPunches: string[];
    onSuccess: () => void;
}

import { motion, AnimatePresence } from 'framer-motion';

export function TimeAdjustmentModal({
    isOpen,
    onClose,
    employeeId,
    employeeName,
    date,
    currentPunches,
    onSuccess
}: TimeAdjustmentModalProps) {
    const [punches, setPunches] = useState<string[]>(currentPunches);
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddPunch = () => {
        setPunches([...punches, '00:00']);
    };

    const handleRemovePunch = (index: number) => {
        const newPunches = [...punches];
        newPunches.splice(index, 1);
        setPunches(newPunches);
    };

    const handlePunchChange = (index: number, value: string) => {
        const newPunches = [...punches];
        newPunches[index] = value;
        setPunches(newPunches);
    };

    const handleSave = async () => {
        if (!justification.trim()) {
            toast.error('A justificativa é obrigatória.');
            return;
        }

        setLoading(true);
        const sortedPunches = [...punches].sort();
        const res = await adjustTimeRecords(employeeId, date, sortedPunches, justification);
        setLoading(false);

        if (res.success) {
            toast.success('Ajuste salvo com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error('Erro ao salvar ajuste.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ajuste Estratégico - ${date.split('-').reverse().join('/')}`}
            width="md"
        >
            <div className="space-y-8 p-2">
                {/* Employee Info Header */}
                <div className="bg-text-primary/5 border border-border rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-brand-orange/10 transition-colors" />
                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest block mb-1">Colaborador em Ajuste</span>
                    <p className="text-lg font-black text-text-primary uppercase tracking-tight">{employeeName}</p>
                </div>

                {/* Punches Logic */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-2">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Registros de Intervalo</span>
                        <button
                            onClick={handleAddPunch}
                            className="text-[10px] font-black text-brand-orange uppercase tracking-widest hover:text-text-primary transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" /> Adicionar Batida
                        </button>
                    </div>

                    <div className="space-y-3 max-h-52 overflow-y-auto px-1 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {punches.map((p, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex gap-4 group"
                                >
                                    <div className="flex-1 relative">
                                        <Input
                                            type="time"
                                            value={p}
                                            onChange={(e) => handlePunchChange(i, e.target.value)}
                                            className="h-12 bg-surface border-border rounded-xl px-6 text-sm text-text-primary font-mono font-black focus:border-brand-orange/50 transition-all shadow-inner"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemovePunch(i)}
                                        className="w-12 h-12 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {punches.length === 0 && (
                            <div className="py-12 text-center bg-text-primary/2 rounded-2xl border border-border border-dashed">
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Nenhuma batida registrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Justification */}
                <div className="space-y-2 px-2">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Justificativa Operacional</label>
                    <textarea
                        className="w-full h-24 bg-surface border border-border rounded-2xl p-4 text-[11px] font-black text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-brand-orange/50 transition-all shadow-inner resize-none"
                        placeholder="Descreva o motivo desta correção..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                </div>

                {/* Actions */}
                <div className="pt-2 flex justify-end gap-4 border-t border-border pt-6">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
                    >
                        Descartar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-10 h-14 rounded-2xl bg-text-primary text-surface text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                        Consolidar Ajuste
                    </button>
                </div>
            </div>
        </Modal>
    );
}
