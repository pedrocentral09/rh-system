'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';

export async function signDocument(documentId: string, confirmationCode: string, ipAddress?: string) {
    try {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: { employee: true }
        });

        if (!document) {
            return { success: false, error: 'Documento não encontrado.' };
        }

        if (document.status === 'SIGNED') {
            return { success: false, error: 'Este documento já foi assinado.' };
        }

        // Generate SHA-256 Hash for the signature
        // We hash the document ID, parent employee ID, code, and timestamp
        const timestamp = new Date().toISOString();
        const dataToHash = `${documentId}|${document.employeeId}|${confirmationCode}|${timestamp}`;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'SIGNED',
                signatureHash: hash,
                signatureDate: new Date(),
                signatureIp: ipAddress || 'Unknown'
            }
        });

        try {
            revalidatePath('/dashboard/personnel');
        } catch (e) {
            // Ignore revalidation errors in non-Next.js environments (standalone scripts)
            console.log('Skipping revalidatePath: No Next.js context');
        }
        return { success: true, hash };
    } catch (error) {
        console.error('Error signing document:', error);
        return { success: false, error: 'Falha ao assinar documento.' };
    }
}
