'use client';

import { useState } from 'react';
import { autoArchiveDocument } from '@/lib/firebase/auto-archive';

interface EmployeeSheet {
    employeeId: string;
    employeeName: string;
    elementId: string;
}

interface Props {
    employees: EmployeeSheet[];
    periodRef: string; // e.g. "02-2026"
}

import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Archive, Loader2, CheckCircle2, AlertTriangle, Cloud } from 'lucide-react';

export function TimesheetArchiveTrigger({ employees, periodRef }: Props) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
    const [progress, setProgress] = useState(0);

    const handleArchiveAll = async () => {
        setStatus('generating');
        setProgress(0);

        try {
            const html2canvas = (await import('html2canvas-pro')).default;
            const { jsPDF } = await import('jspdf');

            for (let i = 0; i < employees.length; i++) {
                const emp = employees[i];
                setProgress(i + 1);

                const element = document.getElementById(emp.elementId);
                if (!element) continue;

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    backgroundColor: '#ffffff',
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();
                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;

                pdf.addImage(imgData, 'PNG', imgX, 0, imgWidth * ratio, imgHeight * ratio);

                // Archive to Firebase
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                const fileName = `folha_ponto_${periodRef}.pdf`;

                await autoArchiveDocument(
                    emp.employeeId,
                    emp.employeeName,
                    'ponto',
                    pdfBase64,
                    fileName
                );
            }

            setStatus('done');
        } catch (e) {
            console.error('Archive error:', e);
            setStatus('error');
        }
    };

    return (
        <div className="print:hidden flex items-center gap-4 bg-[#0A0F1C]/60 backdrop-blur-xl p-4 px-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/10 transition-all" />

            <button
                onClick={() => window.print()}
                className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95 shadow-lg"
            >
                <Printer className="h-4 w-4 text-slate-500" /> IMPRIMIR JOTE
            </button>

            <button
                onClick={handleArchiveAll}
                disabled={status === 'generating'}
                className={`h-12 px-8 rounded-2xl transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-50 border ${status === 'generating' ? 'bg-blue-600 text-white border-blue-500' :
                        status === 'done' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            status === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-white text-black hover:bg-blue-600 hover:text-white border-transparent'
                    }`}
            >
                <AnimatePresence mode="wait">
                    {status === 'generating' ? (
                        <motion.div
                            key="gen"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-3"
                        >
                            <Loader2 className="h-4 w-4 animate-spin" />
                            PROCESSANDO {progress}/{employees.length}
                        </motion.div>
                    ) : status === 'done' ? (
                        <motion.div
                            key="done"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <CheckCircle2 className="h-4 w-4" /> ARQUIVO CONCLUÍDO
                        </motion.div>
                    ) : status === 'error' ? (
                        <motion.div
                            key="err"
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3"
                        >
                            <AlertTriangle className="h-4 w-4" /> FALHA NA TRANSMISSÃO
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center gap-3"
                        >
                            <Cloud className="h-4 w-4" /> PERSISTIR EM NUVEM
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>

            {status === 'generating' && (
                <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress / employees.length) * 100}%` }}
                />
            )}
        </div>
    );
}
