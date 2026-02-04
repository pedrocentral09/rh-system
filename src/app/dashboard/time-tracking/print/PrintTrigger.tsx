'use client';

import { useEffect } from 'react';

export function PrintTrigger() {
    useEffect(() => {
        // Auto-print on load
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <button
            onClick={() => window.print()}
            className="print:hidden fixed bottom-8 right-8 bg-black text-white p-4 rounded-full shadow-xl hover:bg-slate-800 transition-all flex items-center gap-2 z-50"
            title="Imprimir"
        >
            <span>🖨️</span>
            <span className="font-bold">Imprimir / Salvar PDF</span>
        </button>
    );
}
