'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Link as LinkIcon, UserPlus, Loader2, ChevronRight } from 'lucide-react';
import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { toast } from 'sonner';
import { initiateSelfOnboarding } from '../actions/employees';

interface EmployeeOnboardingRequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EmployeeOnboardingRequestModal({ isOpen, onClose, onSuccess }: EmployeeOnboardingRequestModalProps) {
    const [cpf, setCpf] = useState('');
    const [loading, setLoading] = useState(false);
    const [generatedLink, setGeneratedLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleGenerate = async () => {
        const cleanCpf = cpf.replace(/\D/g, '');
        if (!cleanCpf || cleanCpf.length !== 11) {
            toast.error('Informe um CPF válido com 11 dígitos');
            return;
        }

        setLoading(true);
        try {
            const result = await initiateSelfOnboarding(cleanCpf);
            if (result.success && result.data?.id) {
                const baseUrl = window.location.origin;
                const link = `${baseUrl}/onboarding/${result.data.id}`;
                setGeneratedLink(link);
                toast.success('Protocolo de autocadastro gerado!');
                onSuccess();
            } else {
                toast.error(result.message || 'Erro ao iniciar processo');
            }
        } catch (error) {
            console.error('Onboarding Generation Error:', error);
            toast.error('Erro técnico ao gerar protocolo');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copiado para a área de transferência');
        }
    };

    const handleReset = () => {
        setCpf('');
        setGeneratedLink(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => {
                if (!generatedLink) onClose();
                else handleReset();
            }}
            hideHeader
            width="xl"
        >
            <div className="bg-surface/95 backdrop-blur-3xl rounded-[2.5rem] p-0 overflow-hidden relative border border-border">
                <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/5 blur-[80px] rounded-full -ml-32 -mt-32 pointer-events-none" />

                <div className="p-10 space-y-10 relative z-10">
                    {/* Header */}
                    <div className="flex items-center gap-6 pb-8 border-b border-border">
                        <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center shadow-2xl">
                            <UserPlus className="h-8 w-8 text-brand-blue" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-text-primary uppercase tracking-tight italic">Protocolo de Autocadastro</h3>
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mt-1 opacity-80">Expedição de Vínculo Digital</p>
                        </div>
                    </div>

                    {!generatedLink ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                            <div className="bg-surface-secondary border border-border p-8 rounded-3xl space-y-6 shadow-inner">
                                <p className="text-[11px] font-bold text-text-secondary uppercase tracking-widest leading-relaxed opacity-100">
                                    Informe o CPF matricial do novo colaborador para gerar um protocolo exclusivo de autocadastro.
                                    O fluxo de captura documental será habilitado via web.
                                </p>
                                <div className="space-y-4">
                                    <label htmlFor="cpf" className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-4 italic">CPF do Colaborador</label>
                                    <input
                                        id="cpf"
                                        placeholder="000.000.000-00"
                                        value={cpf}
                                        onChange={(e) => setCpf(e.target.value)}
                                        className="w-full h-20 bg-surface border border-border text-text-primary rounded-[1.25rem] text-3xl text-center font-black tracking-[0.2em] focus:border-brand-blue/50 focus:bg-surface transition-all shadow-inner placeholder:text-text-muted/10 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end items-center gap-8 pt-6 border-t border-border">
                                <button
                                    onClick={onClose}
                                    className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="h-16 px-12 rounded-[1.25rem] bg-brand-blue text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-brand-blue/20 flex items-center justify-center gap-3 border-b-4 border-black/20"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LinkIcon className="w-5 h-5" />}
                                    GERAR VÍNCULO DIGITAL 🚀
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                            <div className="bg-brand-blue/5 border border-brand-blue/10 rounded-[2.5rem] p-10 text-center space-y-8 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                <div className="h-20 w-20 bg-brand-blue/10 border border-brand-blue/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl relative">
                                    <div className="absolute inset-0 bg-brand-blue/20 blur-2xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-1000 opacity-20" />
                                    <LinkIcon className="h-8 w-8 text-brand-blue relative z-10" />
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-black text-text-primary uppercase tracking-tight italic">Protocolo Gerado!</h3>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-80">
                                        Expedição concluída. Transmita o link seguro abaixo.
                                    </p>
                                </div>

                                <div className="flex items-center gap-4 bg-surface border border-border rounded-2xl p-6 group/link shadow-inner relative overflow-hidden">
                                    <div className="absolute inset-0 bg-brand-blue/5 -translate-x-full group-hover/link:translate-x-full transition-transform duration-700" />
                                    <span className="text-xs text-text-primary font-mono truncate flex-1 block overflow-hidden font-black tracking-tight relative z-10">
                                        {generatedLink}
                                    </span>
                                    <button
                                        className="h-10 w-10 p-0 shrink-0 bg-surface-secondary border border-border rounded-xl flex items-center justify-center hover:bg-brand-blue hover:text-white hover:border-brand-blue transition-all active:scale-95 group/copy relative z-10"
                                        onClick={handleCopy}
                                    >
                                        {copied ? <Check className="h-4 w-4 text-white" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>

                                <button
                                    onClick={handleCopy}
                                    className="w-full h-20 bg-emerald-600 text-white rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl shadow-emerald-600/20 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 border-b-4 border-black/20"
                                >
                                    <Copy className="h-5 w-5" />
                                    COPIAR PARA TRANSFERÊNCIA
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-10 border-t border-border mt-6">
                                <button
                                    onClick={handleReset}
                                    className="text-[9px] font-black text-text-secondary uppercase tracking-widest hover:text-brand-blue transition-colors underline decoration-2 underline-offset-8"
                                >
                                    Novo Protocolo (CPF)
                                </button>
                                <button
                                    onClick={onClose}
                                    className="h-12 px-8 rounded-xl bg-surface-secondary border border-border text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-text-primary hover:bg-surface transition-all"
                                >
                                    Encerrar Sessão
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
