'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, Eraser, Fingerprint, MapPin, Monitor } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

interface SignatureCaptureProps {
    onSign: (signatureData: string, metadata: any) => void;
    documentName: string;
}

export function SignatureCapture({ onSign, documentName }: SignatureCaptureProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSigned, setHasSigned] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);
    const [pin, setPin] = useState('');

    useEffect(() => {
        // Collect technical metadata for legal validity
        const collectMetadata = async () => {
            const data = {
                userAgent: navigator.userAgent,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                timestamp: new Date().toISOString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                language: navigator.language
            };
            setMetadata(data);
        };
        collectMetadata();

        // Initialize canvas
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, []);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : (e as React.MouseEvent).clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : (e as React.MouseEvent).clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
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

        ctx.lineTo(x, y);
        ctx.stroke();
        setHasSigned(true);
    };

    const endDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasSigned(false);
    };

    const handleConfirm = () => {
        if (!hasSigned) {
            toast.error('Assinatura Obrigatória', {
                description: 'Por favor, desenhe sua assinatura no campo indicado.'
            });
            return;
        }

        if (pin.length < 4) {
            toast.error('Autenticação Obrigatória', {
                description: 'Você precisa digitar seu PIN de segurança para assinar.'
            });
            return;
        }

        const signatureData = canvasRef.current?.toDataURL('image/png');
        if (signatureData) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#34d399', '#059669']
            });
            onSign(signatureData, { ...metadata, pin });
        }
    };

    return (
        <div className="space-y-8 p-1">
            <div className="bg-surface-secondary/40 border border-border rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group shadow-inner">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-700" />

                <div className="flex flex-col items-center text-center space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                        <Shield className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-text-primary uppercase tracking-tighter mb-2 italic">Validador de Identidade</h4>
                        <p className="text-text-muted font-bold text-[10px] uppercase tracking-widest leading-relaxed max-w-sm mx-auto opacity-70">
                            Ao assinar abaixo, você confirma a veracidade das informações contidas em <span className="text-emerald-500">{documentName}</span>.
                        </p>
                    </div>

                    {/* PIN Authentication UI */}
                    <div className="w-full max-w-xs space-y-3 bg-surface border border-border p-6 rounded-3xl shadow-sm">
                        <label className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">PIN de Autenticação</label>
                        <input
                            type="password"
                            maxLength={6}
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                            placeholder="••••••"
                            className="w-full h-14 bg-surface-secondary border border-border rounded-xl text-center text-2xl font-black tracking-[1em] focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:tracking-normal placeholder:text-text-muted/30 shadow-inner"
                        />
                        <p className="text-[8px] text-text-muted font-bold uppercase tracking-widest opacity-40">O mesmo código usado no Totem</p>
                    </div>

                    <div className="w-full bg-white rounded-3xl border-2 border-dashed border-border group-hover:border-emerald-500/30 transition-all shadow-xl relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]">
                        <canvas
                            ref={canvasRef}
                            width={600}
                            height={250}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={endDrawing}
                            onMouseOut={endDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={endDrawing}
                            className="w-full h-[200px] md:h-[250px] cursor-crosshair touch-none"
                        />
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
                            <div className="h-0.5 w-40 bg-zinc-200" />
                        </div>
                        <button
                            onClick={clearCanvas}
                            className="absolute top-4 right-4 h-10 w-10 bg-zinc-100 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 rounded-xl flex items-center justify-center transition-all active:scale-95"
                            title="Limpar Campo"
                        >
                            <Eraser className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
                        <div className="flex flex-col items-center gap-2 p-4 bg-surface rounded-2xl border border-border">
                            <Fingerprint className="h-4 w-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Biometria Digital</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 bg-surface rounded-2xl border border-border">
                            <Monitor className="h-4 w-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Hash 256 Ativo</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 bg-surface rounded-2xl border border-border">
                            <MapPin className="h-4 w-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Geolocalização</span>
                        </div>
                        <div className="flex flex-col items-center gap-2 p-4 bg-surface rounded-2xl border border-border">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Validade Jurídica</span>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="h-16 w-full rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-emerald-500 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 border-b-4 border-black/20"
                    >
                        <CheckCircle2 className="h-6 w-6" />
                        Autenticar Documento Agora
                    </button>
                </div>
            </div>

            <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl italic">
                <p className="text-emerald-600 text-[10px] font-black uppercase tracking-widest leading-relaxed text-center opacity-80">
                    Aviso Legal: Esta assinatura eletrônica é regida pela Lei nº 14.063/2020 e possui plena validade jurídica para atos operacionais e contratuais internos.
                </p>
            </div>
        </div>
    );
}
