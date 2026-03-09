'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, Eraser, CheckCircle2, ChevronRight, PenTool } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { signDocumentAction } from '@/modules/documents/actions/signature';
import { toast } from 'sonner';

interface SignatureModalProps {
    documentId: string;
    documentName: string;
    onClose: () => void;
    onSuccess: () => void;
}

export function SignatureModal({ documentId, documentName, onClose, onSuccess }: SignatureModalProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        setHasDrawn(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.beginPath();
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#FFFFFF';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setHasDrawn(false);
        }
    };

    const handleSubmit = async () => {
        if (!hasDrawn) {
            toast.error('Por favor, desenhe sua assinatura antes de confirmar.');
            return;
        }

        setIsSubmitting(true);
        try {
            const canvas = canvasRef.current;
            const dataUrl = canvas?.toDataURL('image/png') || '';

            const res = await signDocumentAction(documentId, {
                imageUrl: dataUrl,
                ip: '127.0.0.1', // Should be handled server-side usually, but let's pass a placeholder
                userAgent: navigator.userAgent
            });

            if (res.success) {
                toast.success('Assinatura processada com sucesso!');
                onSuccess();
                onClose();
            } else {
                toast.error(res.error || 'Erro ao assinar');
            }
        } catch (error) {
            toast.error('Erro crítico na assinatura');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-[#0A0F1C] border border-white/10 rounded-[40px] shadow-[0_32px_128px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            >
                {/* Header Decoration */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-brand-orange to-transparent opacity-50" />
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full" />

                <div className="p-10 space-y-8">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Ambiente Securitizado</span>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic">Assinatura Digital</h3>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest opacity-60">Documento: {documentName}</p>
                        </div>
                        <button onClick={onClose} className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 transition-all">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <PenTool className="h-3 w-3" />
                                Assine no campo abaixo
                            </label>
                            <button onClick={clear} className="text-[10px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 hover:opacity-70 transition-opacity">
                                <Eraser className="h-3 w-3" />
                                Limpar
                            </button>
                        </div>

                        <div className="relative aspect-[2/1] bg-slate-900/50 border-2 border-dashed border-white/10 rounded-3xl overflow-hidden group">
                            <canvas
                                ref={canvasRef}
                                width={600}
                                height={300}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-full cursor-crosshair touch-none"
                            />
                            {!hasDrawn && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
                                    <span className="text-xs font-black text-white uppercase tracking-[0.4em]">Toque ou clique para assinar</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-3xl border border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider text-center">
                            Ao confirmar, você declara ter lido e concordado com o conteúdo do documento. <br />
                            A assinatura será vinculada ao seu <span className="text-slate-300">IP</span> e <span className="text-slate-300">Hash de Integridade</span>.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="primary"
                            className="h-16 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest border-none"
                            onClick={onClose}
                        >
                            Cancelar
                        </Button>
                        <Button
                            className="h-16 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-brand-orange/20 border-none"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !hasDrawn}
                        >
                            {isSubmitting ? 'Processando...' : 'Confirmar e Assinar'}
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
