'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { uploadBufferToStorage } from '@/lib/firebase/server-storage';
import { jsPDF } from 'jspdf';
import { revalidatePath } from 'next/cache';
import { createNotificationAction } from '@/modules/core/actions/notifications';

export async function generateDocumentFromTemplateAction(templateId: string, employeeId: string) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
            return { success: false, error: 'Não autorizado.' };
        }

        // 1. Fetch Template and Employee
        const template = await (prisma as any).documentTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) return { success: false, error: 'Matriz não encontrada.' };

        const employee = await prisma.employee.findUnique({
            where: { id: employeeId },
            include: {
                address: true,
                contract: {
                    include: {
                        jobRole: true,
                        store: true
                    }
                }
            }
        });

        if (!employee) return { success: false, error: 'Colaborador não encontrado.' };

        // 2. Variable Replacement Engine
        let content = template.content;
        const replacements: Record<string, string> = {
            'nome': employee.name,
            'cpf': employee.cpf || '—',
            'rg': employee.rg || '—',
            'cargo': employee.contract?.jobRole?.name || employee.jobTitle || '—',
            'loja': employee.contract?.store?.name || '—',
            'salario': employee.contract?.baseSalary?.toString() || '—',
            'data_admissao': employee.contract?.admissionDate ? new Date(employee.contract.admissionDate).toLocaleDateString('pt-BR') : '—',
            'endereco': employee.address ? `${employee.address.street}, ${employee.address.number}` : '—',
            'cidade': employee.address?.city || '—',
            'estado': employee.address?.state || '—',
            'data_atual': new Date().toLocaleDateString('pt-BR')
        };

        Object.entries(replacements).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            content = content.replace(regex, value);
        });

        // 3. PDF Generation (Basic Version using jsPDF)
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text(template.title.toUpperCase(), 105, 20, { align: 'center' });

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        const splitText = doc.splitTextToSize(content.replace(/<[^>]*>?/gm, ''), 180);
        doc.text(splitText, 15, 40);

        const pdfArrayBuffer = doc.output('arraybuffer');
        const buffer = Buffer.from(pdfArrayBuffer);

        // 4. Upload to Storage
        const sanitizedTitle = template.title.toLowerCase().replace(/\s+/g, '_');
        const filename = `${sanitizedTitle}_${Date.now()}.pdf`;
        const path = `employees/${employee.id}/generated_docs/${filename}`;

        const fileUrl = await uploadBufferToStorage(buffer, path, 'application/pdf');

        // 5. Create Document Record
        const newDoc = await prisma.document.create({
            data: {
                employeeId: employee.id,
                fileName: filename,
                fileUrl: fileUrl,
                type: template.category,
                status: 'PENDING'
            }
        });

        // 6. Notify Employee
        if (employee.userId) {
            await createNotificationAction({
                userId: employee.userId,
                title: '📜 Novo Documento Pendente',
                message: `O documento "${template.title}" está disponível para sua assinatura.`,
                type: 'WARNING',
                link: '/portal/documents'
            });
        }

        revalidatePath(`/dashboard/personnel/${employee.id}`);
        return { success: true, data: newDoc };

    } catch (error) {
        console.error('Error generating document:', error);
        return { success: false, error: 'Falha crítica na síntese do documento.' };
    }
}
