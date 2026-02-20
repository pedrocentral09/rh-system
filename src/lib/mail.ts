import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export async function sendMail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!process.env.SMTP_HOST) {
        console.warn('⚠️ SMTP_HOST not configured. Skipping email send to:', to);
        console.log('--- EMAIL CONTENT ---');
        console.log(`Subject: ${subject}`);
        console.log(`To: ${to}`);
        console.log(html);
        console.log('----------------------');
        return { success: false, error: 'SMTP not configured' };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Sistema RH" <no-reply@sistema.com.br>',
            to,
            subject,
            html,
        });
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Error sending email:', error);
        return { success: false, error };
    }
}
