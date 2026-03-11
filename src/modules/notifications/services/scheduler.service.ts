import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { whatsappService } from '../services/whatsapp.service';
import { subHours } from 'date-fns';

export function setupNotificationSchedules() {
    // Check every hour for incomplete onboarding older than 24h
    cron.schedule('0 * * * *', async () => {
        console.log('Running scheduled onboarding reminder check...');
        
        try {
            // Fetch settings
            const settingsList = await prisma.companySettings.findMany({
                where: { key: { startsWith: 'whatsapp_onboarding_' } }
            });
            const settings = Object.fromEntries(settingsList.map(s => [s.key, s.value]));
            
            if (settings['whatsapp_onboarding_enabled'] === 'false') {
                console.log('Onboarding reminders are disabled by config.');
                return;
            }

            const twentyFourHoursAgo = subHours(new Date(), 24);
            
            const incompleteEmployees = await prisma.employee.findMany({
                where: {
                    isIncomplete: true,
                    status: 'ACTIVE',
                    createdAt: {
                        lte: twentyFourHoursAgo
                    },
                    phone: {
                        not: null
                    }
                }
            });

            const template = settings['whatsapp_onboarding_template'] || `Olá, *{name}*! Notamos que seu cadastro de onboarding ainda não foi concluído. 📝\n\nPor favor, complete seus dados através deste link: {link}\n\nIsso é fundamental para sua contratação. Obrigado!`;

            for (const employee of incompleteEmployees) {
                if (employee.phone) {
                    const formattedPhone = formatWhatsAppNumber(employee.phone);
                    const onboardingLink = `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/${employee.id}`;
                    
                    const message = template
                        .replace(/{name}/g, employee.name)
                        .replace(/{link}/g, onboardingLink);
                    
                    await whatsappService.sendMessage(formattedPhone, message);
                    console.log(`Onboarding reminder sent to ${employee.name}`);
                }
            }
        } catch (error) {
            console.error('Error in onboarding reminder cron:', error);
        }
    });

    // Notify Scale (Check daily at 18:00 for tomorrow's scale)
    cron.schedule('0 18 * * *', async () => {
        console.log('Running daily scale notification check...');
        try {
            const settingsList = await prisma.companySettings.findMany({
                where: { key: { startsWith: 'whatsapp_scale_' } }
            });
            const settings = Object.fromEntries(settingsList.map(s => [s.key, s.value]));

            if (settings['whatsapp_scale_enabled'] === 'false') return;

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);

            const scales = await prisma.workScale.findMany({
                where: { date: tomorrow },
                include: { employee: true }
            });

            const template = settings['whatsapp_scale_template'] || `Olá, *{name}*! Sua escala para amanhã ({date}) já está disponível. 🗓️\n\nConfira no portal: {link}`;

            for (const scale of scales) {
                if (scale.employee.phone) {
                    const formattedPhone = formatWhatsAppNumber(scale.employee.phone);
                    const portalLink = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/scales`;
                    
                    const message = template
                        .replace(/{name}/g, scale.employee.name)
                        .replace(/{link}/g, portalLink)
                        .replace(/{date}/g, tomorrow.toLocaleDateString('pt-BR'));

                    await whatsappService.sendMessage(formattedPhone, message);
                }
            }
        } catch (error) {
            console.error('Error in scale notification cron:', error);
        }
    });
}

function formatWhatsAppNumber(phone: string): string {
    // Basic cleaning - keep only digits
    let cleaned = phone.replace(/\D/g, '');
    
    // Brazilian numbers: add 55 if not present
    if (cleaned.length === 11 || cleaned.length === 10) {
        cleaned = '55' + cleaned;
    }
    
    // WhatsApp format requires @c.us at the end
    return `${cleaned}@c.us`;
}
