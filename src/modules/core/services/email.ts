
import nodemailer from 'nodemailer';

// Create a transporter
// If env vars are set, use them. Otherwise, we can use Ethereal for testing or just mock.
// For this MVP, we'll try to use a real transport if provided, or Log mode.

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER || 'test',
        pass: process.env.SMTP_PASS || 'test',
    },
});

export async function sendEmail({ to, subject, html, text }: { to: string, subject: string, html: string, text?: string }) {
    // If we are in Dev and no specific SMTP is set, maybe just log it to avoid errors?
    // But let's simplify: try send, if fail, log.

    if (!process.env.SMTP_HOST) {
        console.log('--- MOCK EMAIL SENT ---');
        console.log('To:', to);
        console.log('Subject:', subject);
        console.log('Content:', text || html);
        console.log('-----------------------');
        return true;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Sistema RH" <no-reply@rhsystem.com>',
            to,
            subject,
            text, // plain text body
            html, // html body
        });
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
}
