'use server';

import { BIService } from '../services/bi.service';
import { requireAuth } from '@/modules/core/actions/auth';

export async function getBIIntelAction(filters?: { companyId?: string, storeId?: string }) {
    try {
        // Double security: Only Admins/Managers should access BI depth
        await requireAuth(['ADMIN', 'MANAGER']);

        const result = await BIService.getBIIntel(filters);
        return result;
    } catch (error) {
        return { success: false, error: 'Falha ao processar inteligência BI.' };
    }
}

export async function getProductivityHeatmapAction(filters?: { storeId?: string }) {
    try {
        await requireAuth(['ADMIN', 'MANAGER']);
        const result = await BIService.getProductivityHeatmap(filters);
        return result;
    } catch (error) {
        return { success: false, error: 'Erro ao gerar heatmap.' };
    }
}
