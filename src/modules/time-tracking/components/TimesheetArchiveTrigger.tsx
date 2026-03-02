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
        <div className="print:hidden flex items-center gap-3">
            <button
                onClick={() => window.print()}
                className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800 transition-all flex items-center gap-2 font-semibold text-sm"
            >
                <span>🖨️</span> Imprimir
            </button>

            <button
                onClick={handleArchiveAll}
                disabled={status === 'generating'}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
            >
                {status === 'generating' ? (
                    <><span className="animate-spin">⏳</span> Arquivando {progress}/{employees.length}...</>
                ) : status === 'done' ? (
                    <><span>✅</span> Arquivado! Clicar para re-arquivar</>
                ) : status === 'error' ? (
                    <><span>❌</span> Erro — Tentar novamente</>
                ) : (
                    <><span>📁</span> Arquivar nas pastas dos colaboradores</>
                )}
            </button>
        </div>
    );
}
