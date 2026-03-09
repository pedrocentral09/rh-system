import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

export type ReportArea = 'PERSONNEL' | 'FINANCIAL' | 'DISCIPLINARY' | 'PUNCTUALITY';

export class ReportService extends BaseService {
    /**
     * Generate Report Data and File
     */
    static async generateReport(area: ReportArea, format: 'PDF' | 'EXCEL', filters?: any): Promise<ServiceResult<any>> {
        try {
            let data: any[] = [];
            let columns: { header: string, key: string }[] = [];
            let title = '';

            // 1. Fetch and Prepare Data
            switch (area) {
                case 'PERSONNEL':
                    title = 'Relatório de Colaboradores';
                    const employees = await prisma.employee.findMany({
                        where: {
                            status: filters?.status || 'ACTIVE',
                            contract: filters?.storeId ? { storeId: filters.storeId } : undefined
                        },
                        include: {
                            contract: { include: { store: true, jobRole: true, sectorDef: true } }
                        }
                    });
                    data = employees.map(e => ({
                        'NOME': e.name,
                        'CPF': e.cpf || '—',
                        'CARGO': e.contract?.jobRole?.name || '—',
                        'SETOR': e.contract?.sectorDef?.name || '—',
                        'LOJA': e.contract?.store?.name || '—',
                        'ADMISSÃO': e.hireDate ? new Date(e.hireDate).toLocaleDateString('pt-BR') : '—',
                        'STATUS': e.status === 'ACTIVE' ? 'ATIVO' : 'DESLIGADO'
                    }));
                    columns = [{ header: 'NOME', key: 'NOME' }, { header: 'CPF', key: 'CPF' }, { header: 'CARGO', key: 'CARGO' }, { header: 'LOJA', key: 'LOJA' }, { header: 'ADMISSÃO', key: 'ADMISSÃO' }];
                    break;

                case 'FINANCIAL':
                    title = 'Projeção de Custos de Folha';
                    const contracts = await prisma.contract.findMany({
                        where: {
                            employee: { status: 'ACTIVE' },
                            storeId: filters?.storeId
                        },
                        include: { employee: true, store: true, jobRole: true }
                    });
                    data = contracts.map(c => {
                        const salary = Number(c.baseSalary);
                        const charges = salary * 0.4;
                        return {
                            'COLABORADOR': c.employee.name,
                            'CARGO': c.jobRole?.name || '—',
                            'LOJA': c.store?.name || '—',
                            'SALÁRIO BASE': salary.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                            'ENCARGOS (EST.)': charges.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                            'CUSTO TOTAL': (salary + charges).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                        };
                    });
                    columns = [{ header: 'COLABORADOR', key: 'COLABORADOR' }, { header: 'CARGO', key: 'CARGO' }, { header: 'SALÁRIO BASE', key: 'SALÁRIO BASE' }, { header: 'CUSTO TOTAL', key: 'CUSTO TOTAL' }];
                    break;

                case 'DISCIPLINARY':
                    title = 'Extrato de Medidas Disciplinares';
                    const records = await prisma.disciplinaryRecord.findMany({
                        where: {
                            date: { gte: filters?.startDate, lte: filters?.endDate }
                        },
                        include: { employee: true }
                    });
                    data = records.map(r => ({
                        'COLABORADOR': r.employee.name,
                        'DATA': new Date(r.date).toLocaleDateString('pt-BR'),
                        'TIPO': r.type === 'WARNING' ? 'ADVERTÊNCIA' : 'SUSPENSÃO',
                        'GRAVIDADE': r.severity,
                        'MOTIVO': r.reason
                    }));
                    columns = [{ header: 'COLABORADOR', key: 'COLABORADOR' }, { header: 'DATA', key: 'DATA' }, { header: 'TIPO', key: 'TIPO' }, { header: 'MOTIVO', key: 'MOTIVO' }];
                    break;
            }

            if (data.length === 0) return this.error(null, 'Nenhum dado encontrado para os filtros selecionados.');

            // 2. Generate File
            if (format === 'EXCEL') {
                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

                // Convert to binary buffer
                const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
                const base64 = buffer.toString('base64');
                return this.success({
                    content: base64,
                    filename: `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`,
                    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                });
            } else {
                const doc = new jsPDF() as any;

                doc.setFontSize(22);
                doc.text(title, 14, 20);
                doc.setFontSize(10);
                doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 30);

                const tableRows = data.map(item => Object.values(item));
                const tableHeaders = [Object.keys(data[0])];

                doc.autoTable({
                    head: tableHeaders,
                    body: tableRows,
                    startY: 40,
                    styles: { fontSize: 8, cellPadding: 3 },
                    headStyles: { fillColor: [255, 120, 0] }, // Brand Orange
                });

                const pdfBase64 = doc.output('datauristring').split(',')[1];
                return this.success({
                    content: pdfBase64,
                    filename: `${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`,
                    contentType: 'application/pdf'
                });
            }

        } catch (error) {
            return this.error(error, 'Falha ao processar relatório corporativo.');
        }
    }
}
