'use client';

import { useState } from 'react';

interface Props {
    employeeName: string;
}

export function DisciplinaryPrintActions({ employeeName }: Props) {
    const [downloading, setDownloading] = useState(false);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = async () => {
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const element = document.getElementById('disciplinary-print-area');
            if (!element) return;

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
        } catch (e) {
            console.error('Erro ao gerar PDF:', e);
            alert('Erro ao gerar o PDF. Tente usar a opção de imprimir e salvar como PDF.');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className="print:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition-all flex items-center gap-2 font-semibold text-sm disabled:opacity-50"
            >
                {downloading ? (
                    <><span className="animate-spin">⏳</span> Gerando...</>
                ) : (
                    <><span>📄</span> Baixar PDF</>
                )}
            </button>
            <button
                onClick={handlePrint}
                className="print:hidden bg-black text-white px-4 py-2 rounded-lg shadow hover:bg-slate-800 transition-all flex items-center gap-2 font-semibold text-sm"
            >
                <span>🖨️</span> Imprimir
            </button>
        </div>
    );
}
