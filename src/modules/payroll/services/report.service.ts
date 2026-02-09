import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';
import { AuditService } from '../../core/services/audit.service';

export class ReportService extends BaseService {
    static async getTurnoverData(filters: any): Promise<ServiceResult<any[]>> {
        try {
            const employees = await prisma.employee.findMany({
                where: {
                    contract: {
                        companyId: filters.companyId || undefined,
                        storeId: filters.storeId || undefined,
                    }
                },
                include: {
                    contract: {
                        include: {
                            jobRole: true,
                            sectorDef: true,
                            company: true,
                            store: true
                        }
                    }
                }
            });

            const data = employees.map(emp => ({
                Nome: emp.name,
                CPF: emp.cpf,
                Cargo: emp.contract?.jobRole?.name || emp.jobTitle || 'N/A',
                Setor: emp.contract?.sectorDef?.name || emp.contract?.sector || 'N/A',
                Empresa: emp.contract?.company?.name || 'N/A',
                Unidade: emp.contract?.store?.name || 'N/A',
                Admissão: emp.contract?.admissionDate ? new Date(emp.contract.admissionDate).toLocaleDateString('pt-BR') : 'N/A',
                Status: emp.status === 'ACTIVE' ? 'Ativo' : 'Desligado',
                Desligamento: emp.contract?.terminationDate ? new Date(emp.contract.terminationDate).toLocaleDateString('pt-BR') : '-'
            }));

            // Audit the export action
            await AuditService.log({
                action: 'EXPORT',
                module: 'PAYROLL',
                resource: 'Report',
                newData: { type: 'Turnover', filters }
            });

            return this.success(data);
        } catch (error) {
            return this.error(error, 'Falha ao gerar dados de turnover');
        }
    }

    static async getPayrollPreview(filters: any): Promise<ServiceResult<any[]>> {
        try {
            const contracts = await prisma.contract.findMany({
                where: {
                    companyId: filters.companyId || undefined,
                    storeId: filters.storeId || undefined,
                    employee: { status: 'ACTIVE' }
                },
                include: {
                    employee: true,
                    jobRole: true,
                    company: true,
                    store: true
                }
            });

            const data = contracts.map(c => {
                const base = Number(c.baseSalary);
                // Simple preview logic
                const insalubrity = c.hasInsalubrity ? (base * Number(c.insalubrityBase || 0) / 100) : 0;
                const total = base + insalubrity + Number(c.monthlyBonus || 0);

                return {
                    Matrícula: c.employee.id.substring(0, 8).toUpperCase(),
                    Colaborador: c.employee.name,
                    CPF: c.employee.cpf,
                    Cargo: c.jobRole?.name || 'N/A',
                    'Salário Base': base,
                    'Adic. Insalubridade': insalubrity,
                    'Bônus Mensal': Number(c.monthlyBonus || 0),
                    'Total Bruto Est.': total
                };
            });

            await AuditService.log({
                action: 'EXPORT',
                module: 'PAYROLL',
                resource: 'Report',
                newData: { type: 'PayrollPreview', filters }
            });

            return this.success(data);
        } catch (error) {
            return this.error(error, 'Falha ao gerar prévia da folha');
        }
    }
}
