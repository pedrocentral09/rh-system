'use server';

import { adminStorage } from './admin';

/**
 * Sanitize name for filesystem-safe paths.
 */
function sanitizeName(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_');
}

export type DocumentCategory =
    | 'punicoes'
    | 'ponto'
    | 'holerites'
    | 'contratos'
    | 'asos'
    | 'documentos_pessoais'
    | 'outros';

/**
 * Auto-archive a document (PDF buffer) to Firebase Storage.
 * Path: employees/{id}_{name}/documents/{category}/{fileName}
 *
 * @param employeeId - Database ID of the employee
 * @param employeeName - Full name of the employee
 * @param category - Document category folder
 * @param pdfBase64 - Base64 encoded PDF content
 * @param fileName - Name of the file to save
 * @returns The public URL of the uploaded file, or null on failure
 */
export async function autoArchiveDocument(
    employeeId: string,
    employeeName: string,
    category: DocumentCategory,
    pdfBase64: string,
    fileName: string
): Promise<string | null> {
    try {
        const namePart = sanitizeName(employeeName);
        const filePath = `employees/${employeeId}_${namePart}/documents/${category}/${fileName}`;

        const buffer = Buffer.from(pdfBase64, 'base64');

        const file = adminStorage.file(filePath);
        await file.save(buffer, {
            metadata: {
                contentType: 'application/pdf',
                metadata: {
                    uploadedBy: 'auto-archive',
                    category: category,
                    employeeId: employeeId,
                    archivedAt: new Date().toISOString(),
                },
            },
        });

        // Make the file publicly readable
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${adminStorage.name}/${filePath}`;

        console.log(`📁 Auto-archived: ${filePath}`);
        return publicUrl;
    } catch (error: any) {
        console.error(`❌ Auto-archive failed for ${employeeName}:`, error.message);
        return null;
    }
}

/**
 * Auto-archive from a client-side action (receives base64 from the browser).
 */
export async function archiveDisciplinaryPDF(
    employeeId: string,
    employeeName: string,
    recordType: string,
    recordDate: string,
    pdfBase64: string
): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const dateStr = recordDate.replace(/\//g, '-');
        const typeName = recordType === 'WARNING' ? 'advertencia' :
            recordType === 'SUSPENSION' ? 'suspensao' :
                recordType === 'TERMINATION' ? 'demissao' : 'outro';
        const fileName = `${typeName}_${dateStr}.pdf`;

        const url = await autoArchiveDocument(
            employeeId,
            employeeName,
            'punicoes',
            pdfBase64,
            fileName
        );

        if (url) {
            return { success: true, url };
        }
        return { success: false, error: 'Falha ao salvar no Firebase' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
