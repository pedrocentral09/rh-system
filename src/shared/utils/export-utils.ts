import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param filename - Name of the file without extension
 * @param sheetName - Name of the worksheet (optional)
 */
export function exportToExcel<T extends Record<string, any>>(
    data: T[],
    filename: string,
    sheetName: string = 'Data'
): void {
    try {
        // Create worksheet from data
        const worksheet = XLSX.utils.json_to_sheet(data);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate Excel file and trigger download
        XLSX.writeFile(workbook, `${filename}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
        throw new Error('Falha ao exportar para Excel');
    }
}

/**
 * Export data to PDF file with table
 * @param data - Array of objects to export
 * @param columns - Column definitions with header and dataKey
 * @param title - Title of the PDF document
 * @param filename - Name of the file without extension
 */
export function exportToPDF<T extends Record<string, any>>(
    data: T[],
    columns: { header: string; dataKey: keyof T }[],
    title: string,
    filename: string
): void {
    try {
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(16);
        doc.text(title, 14, 15);

        // Add generation date
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 22);

        // Prepare table data
        const tableColumns = columns.map(col => col.header);
        const tableRows = data.map(row =>
            columns.map(col => {
                const value = row[col.dataKey];
                return value !== null && value !== undefined ? String(value) : '-';
            })
        );

        // Generate table
        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 28,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [79, 70, 229], // Indigo-600
                textColor: 255,
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252] // Slate-50
            }
        });

        // Save PDF
        doc.save(`${filename}.pdf`);
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw new Error('Falha ao exportar para PDF');
    }
}

/**
 * Format date for export (Brazilian format)
 */
export function formatDateForExport(date: Date | string | null): string {
    if (!date) return '-';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR');
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(value: number | string | null): string {
    if (value === null || value === undefined) return 'R$ 0,00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(num);
}
