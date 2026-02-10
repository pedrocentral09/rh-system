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
            <DialogContent className="sm:max-w-[425px] border-none shadow-2xl bg-slate-900 text-white rounded-none">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/20 rounded-none border border-emerald-500/30">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <DialogTitle className="text-xl font-bold tracking-tight uppercase">Autenticar Assinatura</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-400">
                        Confirmando validade jurídica para: <span className="text-emerald-400 font-medium underline">{documentName}</span>
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
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-xs font-bold uppercase tracking-widest text-slate-500">
                                    Código de Confirmação Interna
                                </Label>
                                <Input
                                    id="code"
                                    type="password"
                                    placeholder="••••••"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-white rounded-none h-12 text-center text-2xl tracking-[0.5em] focus:ring-emerald-500/50"
                                    autoFocus
                                />
                            </div>

                            <div className="p-4 bg-slate-800/50 border-l-2 border-emerald-500 text-xs text-slate-400 leading-relaxed italic">
                                Ao assinar, você confirma a autoria deste ato com base nas normas de controle interno do RH Supermercado. Esta operação gera um hash de integridade SHA-256 único.
                            </div>

                            <DialogFooter className="pt-2">
                                <Button
                                    variant="outline"
                                    onClick={resetAndClose}
                                    className="bg-transparent border-slate-700 text-slate-400 hover:bg-slate-800 rounded-none"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSign}
                                    disabled={isSigning || code.length < 4}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 rounded-none shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all active:scale-95"
                                >
                                    {isSigning ? 'Processando...' : 'ASSINAR AGORA'}
                                </Button>
                            </DialogFooter>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 flex flex-col items-center text-center space-y-4"
                        >
                            <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">Documento Autenticado</h3>
                                <p className="text-slate-400 text-sm mt-1">Integridade garantida digitalmente</p>
                            </div>
                            <div className="w-full mt-4 p-3 bg-slate-800 rounded-none border border-slate-700">
                                <Label className="text-[10px] text-slate-500 uppercase block mb-1">HASH SHA-256</Label>
                                <code className="text-[10px] break-all text-emerald-400 font-mono">
                                    {signedHash}
                                </code>
                            </div>
                            <Button
                                onClick={resetAndClose}
                                className="mt-6 bg-white text-slate-900 font-bold w-full rounded-none hover:bg-slate-200"
                            >
                                FECHAR
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
