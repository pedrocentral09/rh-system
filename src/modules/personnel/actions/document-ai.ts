'use server';

import { extractDataFromDocument } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/modules/core/actions/auth";

export async function processDocumentWithAI(imageUrl: string, type: 'IDENTIDADE_FRENTE' | 'ENDERECO') {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        // Map internal types to OCR prompt types
        const ocrType = type === 'IDENTIDADE_FRENTE' ? 'RG' : 'ENDERECO';

        const data = await extractDataFromDocument(imageUrl, ocrType);

        if (!data) {
            return { success: false, error: 'Não foi possível ler o documento automaticamente.' };
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Action error:', error);
        return { success: false, error: error.message };
    }
}
