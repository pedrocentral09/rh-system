'use client';

import { useEffect, useState, useRef } from 'react';
import { autoArchiveDocument, DocumentCategory } from '@/lib/firebase/auto-archive';

interface Props {
    /** ID of the HTML element to capture as PDF */
    printAreaId?: string;
    /** Label for the download filename */
    fileLabel: string;
    /** Employee info for auto-archive */
    employeeId: string;
    employeeName: string;
    /** Firebase category folder */
    category: DocumentCategory;
    /** Specific filename for archive (e.g. holerite_02-2026.pdf) */
    archiveFileName: string;
}

export function AutoArchivePrintTrigger({
    printAreaId = 'print-area',
    fileLabel,
    employeeId,
    employeeName,
    category,
    archiveFileName,
}: Props) {
    const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'archiving' | 'archived' | 'error'>('idle');
    const hasAutoRun = useRef(false);

    const generateAndArchive = async () => {
        setStatus('generating');
        try {
            const html2canvas = (await import('html2canvas-pro')).default;
            const { jsPDF } = await import('jspdf');

            const element = document.getElementById(printAreaId);
            if (!element) {
                console.error(`Element #${printAreaId} not found`);
                setStatus('error');
                return;
            }

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

            // Download
            const safeName = fileLabel.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
            pdf.save(`${safeName}.pdf`);
            setStatus('done');

            // Auto-archive
            setStatus('archiving');
            try {
                const pdfBase64 = pdf.output('datauristring').split(',')[1];
                await autoArchiveDocument(
                    employeeId,
                    employeeName,
                    category,
                    pdfBase64,
                    archiveFileName
                );
                setStatus('archived');
            } catch (archiveErr) {
                console.warn('Auto-archive failed:', archiveErr);
                setStatus('done');
            }
        } catch (e) {
            console.error('PDF generation error:', e);
            setStatus('error');
        }
    };

    // Auto-run on mount
    useEffect(() => {
        if (hasAutoRun.current) return;
        hasAutoRun.current = true;

        const timer = setTimeout(() => {
            generateAndArchive();
        }, 1500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="print:hidden flex items-center gap-3">
            <span className="text-sm text-slate-600">
                {status === 'idle' && '⏳ Preparando...'}
                {status === 'generating' && '⏳ Gerando PDF...'}
                {status === 'done' && '✅ PDF baixado!'}
                {status === 'archiving' && '📁 Arquivando na pasta do colaborador...'}
                {status === 'archived' && '✅ PDF baixado e arquivado!'}
                {status === 'error' && '❌ Erro ao gerar PDF'}
            </span>
            <button
                onClick={() => window.print()}
                className="bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800 transition-all flex items-center gap-2 font-semibold text-sm"
            >
                <span>🖨️</span> Imprimir
            </button>
            {(status === 'done' || status === 'error') && (
                <button
                    onClick={generateAndArchive}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-all flex items-center gap-2 font-semibold text-sm"
                >
                    <span>📄</span> Baixar PDF novamente
                </button>
            )}
        </div>
    );
}
