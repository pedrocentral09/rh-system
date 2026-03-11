'use server';

import { requireAuth } from "@/modules/core/actions/auth";
import { AIDocumentService } from "../services/ai-document.service";

export async function extractTemplateTextAction(base64: string, mimeType: string) {
    try {
        await requireAuth(['ADMIN']);

        // Remove data URL prefix if present
        const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;

        const text = await AIDocumentService.extractTextForTemplate(cleanBase64, mimeType);

        return { success: true, data: text };
    } catch (error: any) {
        return { success: false, error: error.message || "Erro ao processar documento." };
    }
}
