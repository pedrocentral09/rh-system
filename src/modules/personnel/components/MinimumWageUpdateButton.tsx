
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { updateMinimumWageSalaries, getPayrollSettings } from '@/modules/payroll/actions/settings';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, AlertTriangle, Loader2, CheckCircle2, ArrowRightCircle } from 'lucide-react';

export function MinimumWageUpdateButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentWage, setCurrentWage] = useState<number>(0);
    const [newWage, setNewWage] = useState<number>(0);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [updatedCount, setUpdatedCount] = useState(0);

    const handleOpen = async () => {
        setLoading(true);
        const res = await getPayrollSettings();
        if (res.success && res.data) {
            setCurrentWage(res.data.minimumWage);
            setNewWage(res.data.minimumWage);
        }
        setLoading(false);
        setOpen(true);
    };

    const handleUpdate = async () => {
        if (newWage <= currentWage) {
            toast.error('O novo salário deve ser maior que o atual.');
            return;
        }

        setLoading(true);
        const res = await updateMinimumWageSalaries(newWage);
        if (res.success) {
            setUpdatedCount(res.updated || 0);
            setStep('success');
            toast.success('Salários atualizados com sucesso!');
        } else {
            toast.error('Erro ao atualizar salários.');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setStep('form');
        }}>
            <DialogTrigger asChild>
                <button
                    onClick={handleOpen}
                    className="h-14 px-8 rounded-2xl bg-brand-orange/5 border border-brand-orange/20 text-[10px] font-black uppercase tracking-[0.2em] text-brand-orange hover:bg-brand-orange hover:text-white transition-all flex items-center gap-3 active:scale-95 shadow-sm group"
                >
                    <TrendingUp className="w-4 h-4 group-hover:scale-125 transition-transform" /> REAJUSTE MÍNIMO VIGENTE
                </button>
            </DialogTrigger>

            <DialogContent className="bg-surface/95 backdrop-blur-2xl border border-border text-text-primary rounded-[2.5rem] p-0 overflow-hidden shadow-2xl max-w-lg">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="p-10 relative z-10">
                    <AnimatePresence mode="wait">
                        {step === 'form' ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                <div className="space-y-4">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center">
                                        <TrendingUp className="h-8 w-8 text-brand-orange" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Consolidação Salarial</h3>
                                        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-80">Sincronização de Piso Nacional em Lote</p>
                                    </div>
                                </div>

                                <div className="p-6 bg-surface-secondary border border-border rounded-3xl flex gap-5 items-start shadow-inner">
                                    <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-brand-orange" />
                                    </div>
                                    <div className="text-[11px] font-bold text-text-secondary leading-relaxed uppercase tracking-tighter opacity-80">
                                        Esta ação identificará colaboradores que recebem <span className="text-text-primary font-black">R$ {currentWage.toLocaleString('pt-BR')}</span> e atualizará para o novo montante estratégico.
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-4">Novo Salário Mínimo (VIGENTE)</label>
                                    <div className="relative group">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-brand-orange group-focus-within:scale-125 transition-transform">R$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={newWage}
                                            onChange={(e) => setNewWage(Number(e.target.value))}
                                            className="w-full h-20 bg-surface-secondary border border-border rounded-[1.5rem] pl-16 pr-8 text-3xl font-black text-text-primary focus:outline-none focus:border-brand-orange/50 transition-all shadow-inner"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-6 pt-4">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="h-16 flex-1 rounded-2xl text-[10px] font-black text-text-muted uppercase tracking-widest hover:text-text-primary transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        disabled={loading || newWage <= currentWage}
                                        className="h-16 flex-[2] bg-text-primary text-background rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all shadow-2xl active:scale-95 disabled:bg-surface-secondary disabled:text-text-muted flex items-center justify-center gap-3"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightCircle className="w-4 h-4" />}
                                        EXECUTAR REAJUSTE
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center space-y-8 py-10"
                            >
                                <div className="w-24 h-24 bg-emerald-500/10 rounded-[2.5rem] flex items-center justify-center border border-emerald-500/20">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                                </div>
                                <div className="space-y-4 text-center">
                                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight leading-none">Ciclo Concluído</h3>
                                    <div className="p-6 bg-surface-secondary border border-border rounded-3xl shadow-inner">
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] leading-relaxed">
                                            <span className="text-text-primary text-xl font-black block mb-2">{updatedCount} CONTRATOS ATUALIZADOS</span>
                                            PARA <span className="text-emerald-500 text-lg font-black font-mono">R$ {newWage.toLocaleString('pt-BR')}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setOpen(false)}
                                    className="h-16 px-12 bg-text-primary text-background border border-border rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue hover:text-white transition-all w-full shadow-2xl"
                                >
                                    ENCERRAR PROTOCOLO
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    );
}
