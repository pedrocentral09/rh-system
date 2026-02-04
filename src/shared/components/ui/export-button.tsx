'use client';

import { useState } from 'react';
import { Button } from './button';
import { Download, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';

interface ExportButtonProps<T> {
    data: T[];
    filename: string;
    onExportExcel?: () => void;
    onExportPDF?: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    showLabel?: boolean;
}

export function ExportButton<T>({
    data,
    filename,
    onExportExcel,
    onExportPDF,
    variant = 'outline',
    size = 'md',
    showLabel = true
}: ExportButtonProps<T>) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleExport = async (type: 'excel' | 'pdf') => {
        setLoading(true);
        try {
            if (type === 'excel' && onExportExcel) {
                await onExportExcel();
            } else if (type === 'pdf' && onExportPDF) {
                await onExportPDF();
            }
        } finally {
            setLoading(false);
            setIsOpen(false);
        }
    };

    if (!onExportExcel && !onExportPDF) {
        return null;
    }

    return (
        <div className="relative">
            <Button
                variant={variant}
                size={size}
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading || data.length === 0}
                className="gap-2"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <Download className="h-4 w-4" />
                )}
                {showLabel && 'Exportar'}
            </Button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-20">
                        {onExportExcel && (
                            <button
                                onClick={() => handleExport('excel')}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                                <span>Exportar Excel</span>
                            </button>
                        )}
                        {onExportPDF && (
                            <button
                                onClick={() => handleExport('pdf')}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors rounded-b-md"
                            >
                                <FileText className="h-4 w-4 text-red-600" />
                                <span>Exportar PDF</span>
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
