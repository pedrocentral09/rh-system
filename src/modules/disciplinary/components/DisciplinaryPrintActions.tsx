'use client';

import { useEffect, useState, useRef } from 'react';

interface Props {
    employeeName: string;
}

export function DisciplinaryPrintActions({ employeeName }: Props) {
    const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const generatePDF = async () => {
            // Wait for the page to fully render
            await new Promise(resolve => setTimeout(resolve, 1500));

            try {
                const html2canvas = (await import('html2canvas-pro')).default;
                const { jsPDF } = await import('jspdf');

                const element = document.getElementById('disciplinary-print-area');
                if (!element) {
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
                const imgY = 0;

                pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

                const safeName = employeeName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
                pdf.save(`disciplinar_${safeName}.pdf`);
                setStatus('done');
            } catch (e) {
                console.error('Erro ao gerar PDF:', e);
                setStatus('error');
            }
        };

        generatePDF();
    }, [employeeName]);

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600">
                {status === 'loading' && '⏳ Gerando PDF...'}
                {status === 'done' && '✅ PDF baixado com sucesso!'}
                {status === 'error' && '❌ Erro ao gerar PDF'}
            </span>
            <button
                onClick={() => window.print()}
                className="print:hidden bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800 transition-all flex items-center gap-2 font-semibold text-sm"
            >
                <span>🖨️</span> Imprimir
            </button>
        </div>
    );
}
