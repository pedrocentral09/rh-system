'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { revalidatePath } from 'next/cache';
import { createNotificationAction } from '@/modules/core/actions/notifications';
import crypto from 'crypto';

export async function signDocumentAction(documentId: string, signatureData: {
    imageUrl: string;
    ip: string;
    userAgent: string;
    lat?: number;
    lng?: number;
}) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('Acesso negado');

        const employee = await prisma.employee.findUnique({
            where: { userId: user.id }
        });

        if (!employee) throw new Error('Perfil de colaborador não encontrado');

        const document = await prisma.document.findUnique({
            where: { id: documentId }
        });

        if (!document || document.employeeId !== employee.id) {
            throw new Error('Documento não encontrado ou permissão negada');
        }

        if (document.status === 'SIGNED') {
            throw new Error('Este documento já foi assinado');
        }

        // Generate Digital Hash for integrity
        const metadata = `${document.id}-${employee.cpf}-${Date.now()}-${signatureData.ip}`;
        const hash = crypto.createHash('sha256').update(metadata).digest('hex');

        // Update Document with Signature data
        await (prisma as any).document.update({
            where: { id: documentId },
            data: {
                status: 'SIGNED',
                signatureHash: hash,
                signatureImageUrl: signatureData.imageUrl,
                signatureDate: new Date(),
                signatureIp: signatureData.ip,
                signatureUserAgent: signatureData.userAgent,
                signatureLat: signatureData.lat,
                signatureLng: signatureData.lng
            }
        });

        // Notify Admins
        const admins = await (prisma as any).user.findMany({ where: { role: 'ADMIN' } });
        for (const admin of admins) {
            await createNotificationAction({
                userId: admin.id,
                title: '✍️ Documento Assinado',
                message: `${employee.name} assinou o documento "${document.fileName}".`,
                type: 'SUCCESS',
                link: `/dashboard/personnel/${employee.id}`
            });
        }

        revalidatePath('/portal/documents');
        revalidatePath('/dashboard/personnel');

        return { success: true, message: 'Documento assinado digitalmente com sucesso!' };
    } catch (error: any) {
        console.error('[signDocumentAction] error:', error);
        return { success: false, error: error.message };
    }
}
