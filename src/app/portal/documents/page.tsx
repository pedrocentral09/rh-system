'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, ShieldCheck, Clock, CheckCircle2, ChevronRight, Search, Filter, Loader2, PenTool } from 'lucide-react';
import { getEmployeeDocuments } from '@/modules/payroll/actions/employee-portal';
import { SignatureModal } from '@/modules/documents/components/SignatureModal';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function PortalDocumentsPage() {
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [signingDoc, setSigningDoc] = useState<any>(null);

    const loadDocuments = async () => {
        setLoading(true);
        const res = await getEmployeeDocuments();
        if (res.success) setDocuments(res.data || []);
        setLoading(false);
    };

    useEffect(() => {
        loadDocuments();
    }, []);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="h-14 w-14 animate-spin text-brand-orange" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em] animate-pulse">Sincronizando Cofre Digital...</p>
        </div>
    );

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-0.5 w-8 bg-brand-orange" />
                        <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em]">Arquivos & Conformidade</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Meus <span className="text-slate-500 underline decoration-brand-orange/30 underline-offset-4">Documentos</span></h2>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">Acesso seguro aos seus contratos, termos e holerites assinados.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                        <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Protocolo TLS 1.3</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 italic">Conexão Criptografada de Ponta-a-Ponta</p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            {documents.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 gap-4"
                >
                    {documents.map((doc: any) => (
                        <motion.div
                            key={doc.id}
                            variants={item}
                            className="group relative bg-[#111624] border border-white/5 hover:border-brand-orange/30 rounded-[32px] p-2 pr-6 flex items-center gap-6 transition-all duration-500 hover:translate-x-1 shadow-2xl"
                        >
                            <div className={cn(
                                "h-20 w-20 rounded-[28px] flex items-center justify-center border border-white/5 transition-transform duration-500 group-hover:scale-95",
                                doc.status === 'PENDING' ? "bg-rose-500/10" : "bg-emerald-500/10"
                            )}>
                                <FileText className={cn(
                                    "h-8 w-8",
                                    doc.status === 'PENDING' ? "text-rose-400" : "text-emerald-400"
                                )} />
                            </div>

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-3">
                                    <h4 className="text-sm font-[1000] text-white uppercase tracking-tight truncate max-w-[300px]">{doc.fileName}</h4>
                                    <span className={cn(
                                        "text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full border",
                                        doc.status === 'PENDING' ? "bg-rose-500/20 text-rose-400 border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                    )}>
                                        {doc.status === 'PENDING' ? 'Aguardando Assinatura' : 'Doc. Assinado'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" /> Emitido em: {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}</span>
                                    <span className="h-1 w-1 rounded-full bg-white/10" />
                                    <span>Tipo: {doc.type}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {doc.status === 'PENDING' ? (
                                    <Button
                                        onClick={() => setSigningDoc(doc)}
                                        className="h-14 px-8 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-brand-orange/20"
                                    >
                                        <PenTool className="h-4 w-4" />
                                        Assinar Agora
                                    </Button>
                                ) : (
                                    <a
                                        href={doc.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-white/10 transition-all"
                                    >
                                        <Download className="h-4 w-4" />
                                        Baixar PDF
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
                <div className="h-96 bg-white/[0.02] border border-white/5 border-dashed rounded-[48px] flex flex-col items-center justify-center text-center p-10">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <Search className="h-10 w-10 text-slate-700" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Nenhum documento encontrado</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">
                        No momento não existem documentos emitidos para o seu perfil. <br /> Holerites aparecem automaticamente ao fim do mês.
                    </p>
                </div>
            )}

            {/* Signature Modal */}
            <AnimatePresence>
                {signingDoc && (
                    <SignatureModal
                        documentId={signingDoc.id}
                        documentName={signingDoc.fileName}
                        onClose={() => setSigningDoc(null)}
                        onSuccess={loadDocuments}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
