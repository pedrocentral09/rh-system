'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { signDocument } from '../actions/signatures';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ShieldCheck, PenTool } from 'lucide-react';

interface SignatureModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentId: string;
    documentName: string;
}

export function SignatureModal({ isOpen, onClose, documentId, documentName }: SignatureModalProps) {
    const [code, setCode] = useState('');
    const [isSigning, setIsSigning] = useState(false);
    const [signedHash, setSignedHash] = useState<string | null>(null);

    const handleSign = async () => {
        if (code.length < 4) {
            toast.error('O código de confirmação deve ter pelo menos 4 dígitos.');
            return;
        }

        setIsSigning(true);
        try {
            const result = await signDocument(documentId, code);
            if (result.success) {
                setSignedHash(result.hash || '');
                toast.success('Documento assinado com sucesso!');
            } else {
                toast.error(result.error || 'Erro ao assinar documento.');
            }
        } catch (error) {
            toast.error('Erro de conexão ao assinar.');
        } finally {
            setIsSigning(false);
        }
    };

    const resetAndClose = () => {
        setSignedHash(null);
        setCode('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={resetAndClose}>
            <DialogContent className="sm:max-w-[425px] border border-border shadow-2xl bg-surface/95 backdrop-blur-xl text-text-primary rounded-[2rem] overflow-hidden">
                <DialogHeader className="p-2">
                    <div className="flex items-center gap-4 mb-3">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                            <ShieldCheck className="w-8 h-8 text-emerald-400" />
                        </div>
                        <DialogTitle className="text-xl font-black tracking-tight uppercase">Autenticar Assinatura</DialogTitle>
                    </div>
                    <DialogDescription className="text-text-secondary text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-80">
                        Confirmando validade jurídica para:<br />
                        <span className="text-emerald-500 underline decoration-2 underline-offset-4">{documentName}</span>
                    </DialogDescription>
                </DialogHeader>

                <AnimatePresence mode="wait">
                    {!signedHash ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6 pt-4"
                        >
                            <div className="space-y-4">
                                <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary ml-1">
                                    Código de Identidade Digital
                                </Label>
                                <Input
                                    id="code"
                                    type="password"
                                    placeholder="••••••"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="bg-surface-secondary border border-border text-text-primary rounded-2xl h-20 text-center text-3xl tracking-[0.5em] focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all shadow-inner"
                                    autoFocus
                                />
                            </div>

                            <div className="p-6 bg-emerald-500/5 border-l-4 border-emerald-500 rounded-r-2xl text-[10px] text-text-secondary font-bold leading-relaxed uppercase tracking-widest italic opacity-80">
                                Ao assinar, você confirma a autoria deste ato com base nas normas de controle interno. Esta operação gera um protocolo criptográfico de integridade único.
                            </div>

                            <DialogFooter className="pt-6 flex flex-col-reverse sm:flex-row gap-4">
                                <button
                                    onClick={resetAndClose}
                                    className="text-[10px] font-black text-text-secondary uppercase tracking-widest hover:text-text-primary transition-colors h-12"
                                >
                                    Abortar Operação
                                </button>
                                <Button
                                    onClick={handleSign}
                                    disabled={isSigning || code.length < 4}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 h-14 rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                                >
                                    {isSigning ? 'Processando Autenticação...' : 'Autenticar Documento'}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center text-center space-y-8"
                        >
                            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                                <CheckCircle className="w-14 h-14 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Documento Autenticado</h3>
                                <p className="text-text-secondary text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-80">Protocolo de integridade gerado com sucesso</p>
                            </div>
                            <div className="w-full p-6 bg-surface-secondary rounded-2xl border border-border shadow-inner">
                                <Label className="text-[10px] text-text-secondary font-black uppercase tracking-[0.3em] block mb-3 opacity-70">Assinatura Digital SHA-256</Label>
                                <code className="text-[11px] break-all text-emerald-500 font-mono font-bold">
                                    {signedHash}
                                </code>
                            </div>
                            <Button
                                onClick={resetAndClose}
                                className="h-16 bg-text-primary text-background font-black w-full rounded-2xl hover:bg-brand-blue hover:text-white transition-all text-xs tracking-widest"
                            >
                                CONCLUIR PROTOCOLO
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
