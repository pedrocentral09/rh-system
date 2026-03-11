import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export class AIDocumentService {
    static async extractTextForTemplate(base64Content: string, mimeType: string) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

            const prompt = `
                Você é um assistente especialista em transcrição de documentos de RH.
                Analise este documento e faça o seguinte:
                1. Transcreva o conteúdo textual integral do documento de forma limpa e organizada.
                2. Mantenha a estrutura (parágrafos, tópicos, cláusulas).
                3. Onde houver dados variáveis (como nome do funcionário, CPF, cargo, salário, data, etc.), escreva o texto original do documento.
                
                IMPORTANTE: Retorne APENAS o texto transcrevido, sem introduções ou explicações adicionais.
            `;

            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Content,
                        mimeType: mimeType,
                    },
                },
            ]);

            return result.response.text().trim();
        } catch (error) {
            console.error("AI Template Extraction Error:", error);
            throw new Error("Falha ao extrair texto do documento via IA.");
        }
    }
}
