'use client';

import { useEffect, useState } from 'react';
import { getTimeFiles } from '../actions';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle2, History } from 'lucide-react';

export function TimeFileList() {
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        getTimeFiles().then(res => {
            if (res.success) setFiles(res.data || []);
        });
    }, []);

    if (files.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] rounded-[2.5rem] border border-white/5 border-dashed">
                <History className="h-12 w-12 mb-6 text-slate-800" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic text-center">Nenhum evento de importação em cache</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6 ml-4">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                    <History className="h-4 w-4 text-emerald-400" />
                </div>
                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Log de Ingestão AFD</h3>
            </div>

            <div className="space-y-3">
                {files.map((file, i) => (
                    <motion.div
                        key={file.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-6 bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-2xl hover:border-emerald-500/30 hover:bg-white/[0.02] transition-colors group"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileText className="h-6 w-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <div>
                                <p className="text-[13px] font-black text-white uppercase tracking-tight mb-0.5">{file.fileName}</p>
                                <div className="flex items-center gap-3">
                                    <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        {new Date(file.uploadDate).toLocaleString('pt-BR')}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-800" />
                                    <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">
                                        {file.store || 'TERMINAL INDEFINIDO'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full border transition-all ${file.status === 'DONE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                }`}>
                                {file.status === 'DONE' ? 'SINCRONIZADO' : 'PENDENTE'}
                            </span>
                            {file.status === 'DONE' && <CheckCircle2 className="w-4 h-4 text-emerald-500/40" />}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
