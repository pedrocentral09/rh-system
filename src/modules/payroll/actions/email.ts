
'use server';

import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/modules/core/services/email';
import { getPayslipDetails } from './periods'; // Ensure this is exported

export async function sendPayslipByEmail(payslipId: string) {
    try {
        const { data: payslip, company } = await getPayslipDetails(payslipId);

        if (!payslip) return { success: false, error: 'Holerite não encontrado' };
        if (!payslip.employee.email) return { success: false, error: 'Funcionário sem e-mail cadastrado' };

        // Construct HTML email
        // We can reuse the structure from PayslipPrintView but as simple HTML string
        // For brevity, I'll create a simplified version.

        const monthYear = `${payslip.period.month.toString().padStart(2, '0')}/${payslip.period.year}`;

        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; max-width: 600px;">
                <h2 style="color: #333;">Holerite Disponível - ${monthYear}</h2>
                <p>Olá, <strong>${payslip.employee.name}</strong>.</p>
                <p>Seu demonstrativo de pagamento referente a <strong>${monthYear}</strong> foi processado.</p>
                
                <hr />
                
                <table style="width: 100%; text-align: left;">
                    <tr>
                        <td><strong>Total Vencimentos:</strong></td>
                        <td style="color: green;">R$ ${Number(payslip.totalAdditions.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Descontos:</strong></td>
                        <td style="color: red;">R$ ${Number(payslip.totalDeductions.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                        <td style="font-size: 1.2em;"><strong>Líquido a Receber:</strong></td>
                        <td style="font-size: 1.2em; font-weight: bold;">R$ ${Number(payslip.netSalary.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    </tr>
                </table>

                <hr />
                <p style="font-size: 0.8em; color: #777;">Este é um e-mail automático. Não responda.</p>
                <p style="font-size: 0.8em; color: #777;">${company.name}</p>
            </div>
        `;

        const sent = await sendEmail({
            to: payslip.employee.email,
            subject: `Holerite ${monthYear} - ${company.name}`,
            html: htmlContent,
            text: `Seu holerite de ${monthYear} está disponivel. Líquido: R$ ${payslip.netSalary}`
        });

        if (sent) {
            return { success: true, message: 'E-mail enviado com sucesso' };
        } else {
            return { success: false, error: 'Falha no envio do e-mail (SMTP)' };
        }

    } catch (error) {
        console.error('Email Action Error:', error);
        return { success: false, error: 'Erro interno' };
    }
}
