'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getWhatsAppConfig() {
    try {
        const settings = await prisma.companySettings.findMany({
            where: {
                key: {
                    startsWith: 'whatsapp_'
                }
            }
        });

        const config: Record<string, string> = {};
        settings.forEach(s => {
            config[s.key] = s.value;
        });

        return { success: true, data: config };
    } catch (error) {
        console.error('Failed to get WhatsApp config:', error);
        return { success: false, error: 'Erro ao carregar configurações' };
    }
}

export async function updateWhatsAppConfig(config: Record<string, string>) {
    try {
        const data = Object.entries(config).map(([key, value]) => ({
            key,
            value
        }));

        // Use upsert for each setting
        for (const item of data) {
            await prisma.companySettings.upsert({
                where: { key: item.key },
                update: { value: item.value },
                create: { key: item.key, value: item.value }
            });
        }

        revalidatePath('/dashboard/configuration');
        return { success: true };
    } catch (error) {
        console.error('Failed to update WhatsApp config:', error);
        return { success: false, error: 'Erro ao salvar configurações' };
    }
}
