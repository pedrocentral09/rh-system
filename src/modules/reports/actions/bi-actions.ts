'use server';

import { ReportService } from '../services/report.service';
import { requireAuth } from '@/modules/core/actions/auth';
import { REPORT_DATA_DICTIONARY } from '../utils/data-dictionary';

export async function buildDynamicReportAction(config: {
    fieldIds: string[];
    filters: any[];
    groupBy?: string;
    format: 'PDF' | 'EXCEL';
}) {
    try {
        await requireAuth(['ADMIN']);

        // 1. Get raw data from Service
        const result = await ReportService.getDynamicData(config);
        if (!result.success) return result;

        // 2. Generate the physical file (PDF/Excel)
        return await ReportService.generateDynamicFile(result.data, config);

    } catch (error: any) {
        console.error('[buildDynamicReportAction] Error:', error);
        return { success: false, error: error.message || 'Falha ao processar relatório dinâmico.' };
    }
}
