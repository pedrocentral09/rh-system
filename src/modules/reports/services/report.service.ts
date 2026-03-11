import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { REPORT_DATA_DICTIONARY, DataField } from '../utils/data-dictionary';

import { getSystemParameters, SystemParameters } from '@/modules/configuration/actions/settings';

export type ReportArea = 'PERSONNEL' | 'FINANCIAL' | 'DISCIPLINARY' | 'PUNCTUALITY';

export class ReportService extends BaseService {
    /**
     * Get Dynamic Data based on user selection
     */
    static async getDynamicData(config: { fieldIds: string[], filters: any[], groupBy?: string }): Promise<ServiceResult<any>> {
        try {
            const selectedFields = REPORT_DATA_DICTIONARY.filter(f => config.fieldIds.includes(f.id));

            // Fetch System Parameters for calculations
            const paramsRes = await getSystemParameters();
            const params = paramsRes.success ? paramsRes.data : null;

            // 1. Build include object based on paths
            const include: any = {
                contract: {
                    include: {
                        store: true,
                        jobRole: { include: { mandatoryDocuments: true } },
                        sectorDef: true,
                        company: true
                    }
                },
                jobRole: { include: { mandatoryDocuments: true } },
                documents: { where: { status: 'SIGNED' } },
                _count: {
                    select: { medicalLeaves: true }
                }
            };

            // 2. Build dynamic filters
            const where: any = {};

            config.filters.forEach(f => {
                const field = REPORT_DATA_DICTIONARY.find(df => df.id === f.fieldId);
                if (!field) return;

                const parts = field.path.split('.');
                let currentWhere = where;

                // Handle nested relations in WHERE (max 2 levels for safety)
                if (parts.length > 1) {
                    for (let i = 0; i < parts.length - 1; i++) {
                        const part = parts[i];
                        if (!currentWhere[part]) currentWhere[part] = {};
                        currentWhere = currentWhere[part];
                    }
                }

                const targetField = parts[parts.length - 1];
                const operator = f.operator || 'equals';
                let val = f.value;

                // Type casting
                if (field.type === 'number') val = Number(val);
                if (field.type === 'date') val = new Date(val);

                if (operator === 'contains') {
                    currentWhere[targetField] = { contains: val, mode: 'insensitive' };
                } else if (['gt', 'lt', 'gte', 'lte'].includes(operator)) {
                    currentWhere[targetField] = { [operator]: val };
                } else {
                    currentWhere[targetField] = val; // default equals
                }
            });

            const rawData = await prisma.employee.findMany({
                where,
                include
            });

            // 3. Map to Flat structure for the report
            let flatData = rawData.map((emp: any) => {
                const row: any = {};

                // Pre-calculate values if needed for cost fields
                const baseSalary = Number(emp.contract?.baseSalary || 0);
                const decimoTerceiro = baseSalary / 12;
                const ferias = baseSalary / 12;
                const tercoFerias = ferias / 3;
                const baseCalculoEncargos = baseSalary + decimoTerceiro + ferias + tercoFerias;

                selectedFields.forEach(field => {
                    if (field.id === 'complianceScore') {
                        const mandatory = emp.jobRole?.mandatoryDocuments || emp.contract?.jobRole?.mandatoryDocuments || [];
                        const signed = emp.documents || [];
                        const signedTitles = new Set(signed.map((s: any) => s.type));
                        const matches = mandatory.filter((m: any) => signedTitles.has(m.title)).length;
                        const score = mandatory.length > 0 ? (matches / mandatory.length) * 100 : 100;
                        row[field.label] = `${score.toFixed(0)}%`;
                    } else if (field.id.startsWith('cost_') && params) {
                        // Dynamic Cost Calculations
                        let val = 0;
                        switch (field.id) {
                            case 'cost_inss': val = baseCalculoEncargos * (params.rates.inssPatronal / 100); break;
                            case 'cost_rat': val = baseCalculoEncargos * (params.rates.rat / 100); break;
                            case 'cost_fgts': val = baseCalculoEncargos * (params.rates.fgts / 100); break;
                            case 'cost_fgts_penalty': val = (baseCalculoEncargos * (params.rates.fgts / 100)) * (params.rates.fgtsPenalty / 100); break;
                            case 'cost_13th': val = decimoTerceiro; break;
                            case 'cost_vacation': val = ferias + tercoFerias; break;
                            case 'cost_operational': val = params.costs.accountingPerHead + params.costs.medicalExamsMonthly + params.costs.trainingMonthly + params.costs.uniformsEPIMonthly; break;
                            case 'cost_total':
                                val = baseSalary + decimoTerceiro + ferias + tercoFerias +
                                    (baseCalculoEncargos * (params.rates.inssPatronal / 100)) +
                                    (baseCalculoEncargos * (params.rates.rat / 100)) +
                                    (baseCalculoEncargos * (params.rates.fgts / 100)) +
                                    ((baseCalculoEncargos * (params.rates.fgts / 100)) * (params.rates.fgtsPenalty / 100)) +
                                    (params.costs.accountingPerHead + params.costs.medicalExamsMonthly + params.costs.trainingMonthly + params.costs.uniformsEPIMonthly);
                                break;
                        }
                        row[field.label] = val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
                    } else {
                        row[field.label] = this.getFieldValue(emp, field);
                    }
                });
                return row;
            });

            // 4. Handle Grouping if requested
            if (config.groupBy) {
                const groupField = REPORT_DATA_DICTIONARY.find(f => f.id === config.groupBy);
                if (groupField) {
                    flatData = this.groupData(flatData, groupField.label);
                }
            }

            return this.success(flatData);
        } catch (error) {
            return this.error(error, 'Falha ao buscar dados dinâmicos.');
        }
    }

    private static getFieldValue(obj: any, field: DataField) {
        const path = field.path.split('.');
        let val = obj;
        for (const part of path) {
            val = val?.[part];
        }

        if (field.type === 'currency' && val) {
            return Number(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        }
        if (field.type === 'date' && val) {
            return new Date(val).toLocaleDateString('pt-BR');
        }
        return val || '—';
    }

    private static groupData(data: any[], groupLabel: string) {
        const groups: Record<string, any[]> = {};
        data.forEach(row => {
            const key = row[groupLabel] || 'Sem Informação';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
        });

        return Object.entries(groups).map(([key, items]) => {
            const totals: Record<string, number> = {};

            // Calculate totals for numeric/currency fields
            items.forEach(item => {
                Object.keys(item).forEach(k => {
                    const val = item[k];
                    if (typeof val === 'string') {
                        // Try to parse currency or percentage
                        const numeric = parseFloat(val.replace(/[R$\s.%]/g, '').replace(',', '.'));
                        if (!isNaN(numeric)) {
                            totals[k] = (totals[k] || 0) + numeric;
                        }
                    } else if (typeof val === 'number') {
                        totals[k] = (totals[k] || 0) + val;
                    }
                });
            });

            return {
                isGroupHeader: true,
                groupTitle: `${groupLabel}: ${key}`,
                count: items.length,
                items,
                totals
            };
        });
    }

    /**
     * Physical File Generation (Agnostic)
     */
    static async generateDynamicFile(data: any[], config: { format: 'PDF' | 'EXCEL', fieldIds: string[] }): Promise<ServiceResult<any>> {
        try {
            const selectedFields = REPORT_DATA_DICTIONARY.filter(f => config.fieldIds.includes(f.id));
            const headers = selectedFields.map(f => f.label);
            const title = 'Relatório Corporativo Antigravity';

            if (config.format === 'EXCEL') {
                const excelData = data.flatMap(d => {
                    if (d.isGroupHeader) {
                        const totalRow: any = { [headers[0]]: `TOTAL DO GRUPO (${d.count})` };
                        selectedFields.forEach(f => {
                            if (d.totals[f.label] !== undefined) {
                                totalRow[f.label] = (f.type === 'currency')
                                    ? d.totals[f.label].toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    : d.totals[f.label];
                            }
                        });

                        return [
                            { [headers[0]]: `>>> ${d.groupTitle} (${d.count})` },
                            ...d.items,
                            totalRow,
                            {} // Empty row separator
                        ];
                    }
                    return [d];
                });

                const worksheet = XLSX.utils.json_to_sheet(excelData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                return this.success({
                    content: buffer.toString('base64'),
                    filename: `Relatorio_BI_${Date.now()}.xlsx`,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
            } else {
                const doc = new jsPDF('l', 'pt', 'a4'); // Landscape for better visibility
                const autoTableFunc = typeof autoTable === 'function' ? autoTable : (autoTable as any).default;

                doc.setFontSize(22);
                doc.setTextColor(255, 120, 0);
                doc.text(title, 40, 40);
                doc.setFontSize(10);
                doc.setTextColor(100, 100, 100);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 40, 55);

                let currentY = 70;
                const isGrouped = data.length > 0 && data[0].isGroupHeader;

                if (isGrouped) {
                    data.forEach((group) => {
                        doc.setFontSize(11);
                        doc.setTextColor(255, 120, 0);
                        doc.text(group.groupTitle, 40, currentY);
                        currentY += 10;

                        const footerRow = headers.map(h => {
                            const val = group.totals[h];
                            if (val === undefined) return '';
                            const field = selectedFields.find(f => f.label === h);
                            return field?.type === 'currency'
                                ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                : val.toString();
                        });

                        autoTableFunc(doc, {
                            head: [headers],
                            body: [...group.items.map((it: any) => headers.map(h => it[h])), footerRow],
                            startY: currentY,
                            theme: 'striped',
                            styles: { fontSize: 8 },
                            headStyles: { fillColor: [40, 40, 40] },
                            didParseCell: (data: any) => {
                                if (data.row.index === group.items.length) {
                                    data.cell.styles.fontStyle = 'bold';
                                    data.cell.styles.fillColor = [240, 240, 240];
                                }
                            }
                        });

                        currentY = (doc as any).lastAutoTable.finalY + 25;
                        if (currentY > 500) { doc.addPage(); currentY = 40; }
                    });
                } else {
                    const grandTotals: Record<string, number> = {};
                    data.forEach(item => {
                        selectedFields.forEach(f => {
                            const val = item[f.label];
                            if (typeof val === 'string') {
                                const numeric = parseFloat(val.replace(/[R$\s.%]/g, '').replace(',', '.'));
                                if (!isNaN(numeric)) grandTotals[f.label] = (grandTotals[f.label] || 0) + numeric;
                            } else if (typeof val === 'number') {
                                grandTotals[f.label] = (grandTotals[f.label] || 0) + val;
                            }
                        });
                    });

                    const footerRow = headers.map(h => {
                        const val = grandTotals[h];
                        if (val === undefined) return '';
                        const field = selectedFields.find(f => f.label === h);
                        return field?.type === 'currency'
                            ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : val.toString();
                    });

                    autoTableFunc(doc, {
                        head: [headers],
                        body: [...data.map(row => headers.map(h => row[h])), footerRow],
                        startY: currentY,
                        theme: 'striped',
                        styles: { fontSize: 8 },
                        headStyles: { fillColor: [255, 120, 0] },
                        didParseCell: (data: any) => {
                            if (data.row.index === data.table.body.length - 1) {
                                data.cell.styles.fontStyle = 'bold';
                                data.cell.styles.fillColor = [230, 230, 230];
                            }
                        }
                    });
                }

                const pdfBuffer = doc.output('arraybuffer');
                return this.success({
                    content: Buffer.from(pdfBuffer).toString('base64'),
                    filename: `Relatorio_BI_${Date.now()}.pdf`,
                    contentType: 'application/pdf'
                });
            }
        } catch (error) {
            return this.error(error, 'Erro ao gerar arquivo do relatório.');
        }
    }

    // --- Legacy fallbacks for compatibility during transition ---
    static async generateReport(area: ReportArea, format: 'PDF' | 'EXCEL', filters?: any): Promise<ServiceResult<any>> {
        // We will map fixed areas to the new dynamic engine
        const mapping: Record<string, string[]> = {
            'PERSONNEL': ['name', 'cpf', 'jobRole', 'store', 'status'],
            'FINANCIAL': ['name', 'jobRole', 'store', 'salary'],
            'DISCIPLINARY': ['name', 'sector', 'medicalLeavesCount'],
            'PUNCTUALITY': ['name', 'store']
        };

        return this.buildDynamicReportRedirect(mapping[area] || mapping['PERSONNEL'], format, filters);
    }

    private static async buildDynamicReportRedirect(fieldIds: string[], format: 'PDF' | 'EXCEL', filters?: any) {
        const config = { fieldIds, filters: [], format };
        const data = await this.getDynamicData(config);
        if (!data.success) return data;
        return this.generateDynamicFile(data.data, config);
    }
}
