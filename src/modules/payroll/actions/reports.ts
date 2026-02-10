'use server';

import { ReportService } from '../services/report.service';

export async function getTurnoverReport(filters: any) {
    return await ReportService.getTurnoverData(filters);
}

export async function getPayrollReportPreview(filters: any) {
    return await ReportService.getPayrollPreview(filters);
}
