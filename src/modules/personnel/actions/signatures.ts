'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export async function signDocument(
    documentId: string,
    signatureImageUrl: string,
    metadata: {
        userAgent: string;
        pin: string;
        ip?: string;
        lat?: number;
        lng?: number;
    }
) {
    try {
        const document = await prisma.document.findUnique({
            where: { id: documentId },
            include: {
                employee: {
                    select: {
                        id: true,
                        pinHash: true,
                        name: true
                    }
                }
            }
        });

        if (!document) {
            return { success: false, error: 'Documento não encontrado.' };
        }

        if (document.status === 'SIGNED') {
            return { success: false, error: 'Este documento já foi assinado.' };
        }

        // Verify PIN Security
        if (!document.employee.pinHash) {
            return { success: false, error: 'Colaborador sem PIN cadastrado. Favor configurar no Totem.' };
        }

        const isPinValid = await bcrypt.compare(metadata.pin, document.employee.pinHash);
        if (!isPinValid) {
            return { success: false, error: 'PIN de segurança incorreto.' };
        }

        // Generate SHA-256 Hash for the signature
        // We hash the document ID, parent employee ID, the visual signature, and metadata package
        const timestamp = new Date().toISOString();
        const dataToHash = `${documentId}|${document.employeeId}|${signatureImageUrl.slice(-50)}|${metadata.userAgent}|${timestamp}`;
        const hash = crypto.createHash('sha256').update(dataToHash).digest('hex');

        await prisma.document.update({
            where: { id: documentId },
            data: {
                status: 'SIGNED',
                signatureHash: hash,
                signatureImageUrl: signatureImageUrl,
                signatureDate: new Date(),
                signatureIp: metadata.ip || 'Unknown',
                signatureUserAgent: metadata.userAgent,
                signatureLat: metadata.lat,
                signatureLng: metadata.lng
            }
        });

        try {
            revalidatePath('/dashboard/personnel');
        } catch (e) {
            console.log('Skipping revalidatePath: No Next.js context');
        }
        return { success: true, hash };
    } catch (error) {
        console.error('Error signing document:', error);
        return { success: false, error: 'Falha ao assinar documento.' };
    }
}
