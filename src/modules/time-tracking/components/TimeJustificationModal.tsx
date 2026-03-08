'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal';
import { Camera, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface TimeJustificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    onSuccess: () => void;
}

import { motion } from 'framer-motion';

export function TimeJustificationModal({
    isOpen,
    onClose,
    date,
    onSuccess
}: TimeJustificationModalProps) {
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = async () => {
        if (!justification.trim()) {
            toast.error('Por favor, descreva o motivo da justificativa.');
            return;
        }

        setLoading(true);
        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            toast.success('Justificativa enviada com sucesso!');
            onSuccess();
            handleClose();
        }, 1500);
    };

    const handleClose = () => {
        setJustification('');
        setPhoto(null);
        setPreviewUrl(null);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title=""
            width="md"
        >
            <div className="bg-surface p-8 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-brand-orange/5 blur-[80px] rounded-full -mr-24 -mt-24 pointer-events-none" />

                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center">
                            <Camera className="h-5 w-5 text-brand-orange" />
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Justificativa de Jornada</h2>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-14">Referência: {new Date(date).toLocaleDateString('pt-BR')}</p>
                </div>

                <div className="bg-brand-orange/5 border border-brand-orange/10 p-5 rounded-2xl flex gap-4 text-brand-orange relative group overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-brand-orange/20" />
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                        Protocolo de análise ativa pelo RH Central. Se houver atestado, anexe evidência fotográfica em alta resolução.
                    </p>
                </div>

                <div className="space-y-3 group">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Manifestação do Colaborador</label>
                    <textarea
                        className="w-full bg-text-primary/5 border border-border rounded-2xl p-6 text-[12px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all min-h-[140px] shadow-inner placeholder:text-text-muted/40 outline-none block"
                        placeholder="DESCREVA O MOTIVO (EX: ESQUECIMENTO, CONSULTA, FALHA TÉCNICA)..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4">Evidência Digital (Opcional)</label>

                    {!previewUrl ? (
                        <div className="relative group/upload h-32">
                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={handlePhotoChange}
                            />
                            <div className="h-full border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-2 group-hover/upload:bg-text-primary/[0.03] group-hover/upload:border-brand-orange/20 transition-all">
                                <div className="h-10 w-10 bg-text-primary/5 text-text-muted rounded-xl flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:text-brand-orange transition-all">
                                    <Camera className="h-5 w-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Disparar Câmera ou Selecionar</p>
                                    <p className="text-[8px] text-text-muted/60 uppercase font-black tracking-tighter">IMAGENS ATÉ 5MB</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden border border-white/10 group/preview shadow-2xl">
                            <img src={previewUrl} alt="Preview" className="w-full aspect-video object-cover brightness-75 group-hover/preview:brightness-100 transition-all" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity">
                                <button
                                    className="px-6 h-10 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95"
                                    onClick={() => { setPhoto(null); setPreviewUrl(null); }}
                                >
                                    DESCARTAR CAPTURA
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-4">
                    <button
                        onClick={handleClose}
                        className="flex-1 h-14 rounded-2xl bg-text-primary/5 border border-border text-text-muted text-[10px] font-black uppercase tracking-[0.2em] hover:bg-text-primary/10 hover:text-text-primary transition-all active:scale-95"
                    >
                        ABORTAR
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-[2] h-14 bg-text-primary text-surface rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                        TRANSMITIR PARA O RH
                    </button>
                </div>
            </div>
        </Modal>
    );
}
