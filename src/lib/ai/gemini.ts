import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || "");

export async function extractDataFromDocument(imageUrl: string, type: 'RG' | 'CPF' | 'ENDERECO' | 'CNH') {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        // Fetch the image
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString('base64');

        let prompt = "";

        if (type === 'RG' || type === 'CNH') {
            prompt = "Extract the following data from this Brazilian identity document (RG or CNH): full name, document number, CPF (if present), and date of birth. Return ONLY a valid JSON object in this format: { \"name\": \"string\", \"rg\": \"string\", \"cpf\": \"string\", \"birthDate\": \"YYYY-MM-DD\" }. If any field is not found, return null for it.";
        } else if (type === 'CPF') {
            prompt = "Extract the following data from this Brazilian CPF document: full name, CPF number, and date of birth. Return ONLY a valid JSON object in this format: { \"name\": \"string\", \"cpf\": \"string\", \"birthDate\": \"YYYY-MM-DD\" }. If any field is not found, return null for it.";
        } else if (type === 'ENDERECO') {
            prompt = "Extract the following data from this utility bill / proof of residence: full street address, number, neighborhood, city, state, and CEP (zip code). Return ONLY a valid JSON object in this format: { \"street\": \"string\", \"number\": \"string\", \"neighborhood\": \"string\", \"city\": \"string\", \"state\": \"string\", \"zipCode\": \"string\" }. If any field is not found, return null for it.";
        }

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: "image/jpeg",
                },
            },
        ]);

        const text = result.response.text();
        // Clean markdown if present
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }

        return null;
    } catch (error) {
        console.error("Gemini OCR Error:", error);
        return null;
    }
}
