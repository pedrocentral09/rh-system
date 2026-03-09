'use server';

import { ReportService, ReportArea } from '../services/report.service';
import { requireAuth } from '@/modules/core/actions/auth';

export async function generateReportAction(area: ReportArea, format: 'PDF' | 'EXCEL', filters?: any) {
    try {
        // Exclusive for ADMINS as requested by user
        await requireAuth(['ADMIN']);

        const result = await ReportService.generateReport(area, format, filters);
        return result;
    } catch (error) {
        return { success: false, error: 'Erro ao gerar relatório. Verifique suas permissões.' };
    }
}
