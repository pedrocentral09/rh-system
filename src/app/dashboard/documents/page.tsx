'use client';

import { DocumentTemplateManager } from '@/modules/documents/components/DocumentTemplateManager';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

export default function DocumentsPage() {
    return (
        <div className="p-8 md:p-12 space-y-12">
            {/* Legend / Hero Section */}
            <div className="relative bg-surface border border-border rounded-[3rem] p-12 md:p-16 overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-orange/5 blur-[100px] rounded-full -mr-48 -mt-48 pointer-events-none group-hover:bg-brand-orange/10 transition-colors duration-1000" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/5 blur-[80px] rounded-full -ml-40 -mb-40 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                    <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-orange/10 border border-brand-orange/20 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-orange/20 to-transparent animate-pulse" />
                        <FileText className="h-12 w-12 md:h-16 md:w-16 text-brand-orange relative z-10" />
                    </div>
                    <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                            <span className="text-[10px] font-black text-brand-orange uppercase tracking-[0.3em] bg-brand-orange/10 px-5 py-2 rounded-full border border-brand-orange/20 italic">
                                Central de Automação
                            </span>
                            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                <Sparkles className="h-3 w-3 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Inteligência Documental Ativa</span>
                            </div>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-text-primary uppercase tracking-tighter leading-none italic">Documentação</h1>
                        <p className="text-sm md:text-base text-text-secondary font-bold uppercase tracking-widest opacity-60 max-w-2xl">
                            Gerencie matrizes inteligentes, automatize contratos e monitore assinaturas digitais avançadas em uma única interface segura.
                        </p>
                    </div>
                </div>
            </div>

            {/* Template Manager Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DocumentTemplateManager />
            </motion.div>
        </div>
    );
}
