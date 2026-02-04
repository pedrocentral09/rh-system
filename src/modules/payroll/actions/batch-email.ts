
'use server';

import { prisma } from '@/lib/prisma';
import { sendPayslipByEmail } from './email';

export async function sendAllPayslips(periodId: string) {
    try {
        const period = await prisma.payrollPeriod.findUnique({
            where: { id: periodId },
            include: { payslips: true }
        });

        if (!period) return { success: false, error: 'Competência não encontrada.' };

        let sentCount = 0;
        const total = period.payslips.length;

        // In a real scenario, we would use a queue (BullMQ/Inngest)
        // For MVP, we loop. Note: Vercel serverless has timeout limits (10s-60s).
        // If there are many employees, this might timeout.
        // We will process primarily but return "Started".

        // For < 50 employees, a loop await is "okay" for MVP.
        const results = await Promise.all(
            period.payslips.map(async (p) => {
                const res = await sendPayslipByEmail(p.id);
                return res.success;
            })
        );

        sentCount = results.filter(Boolean).length;

        return { success: true, message: `Enviados ${sentCount} de ${total} e-mails.` };

    } catch (error) {
        return { success: false, error: 'Erro no envio em lote.' };
    }
}
