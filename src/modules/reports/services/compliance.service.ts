import { prisma } from '@/lib/prisma';
import { BaseService, ServiceResult } from '@/lib/BaseService';

export interface ComplianceStatus {
    employeeId: string;
    employeeName: string;
    totalMandatory: number;
    totalSigned: number;
    complianceScore: number;
    pendingDocs: string[];
}

export class ComplianceService extends BaseService {
    /**
     * Get compliance status for a specific employee
     */
    static async getEmployeeCompliance(employeeId: string): Promise<ServiceResult<ComplianceStatus>> {
        try {
            const employee = await prisma.employee.findUnique({
                where: { id: employeeId },
                include: {
                    jobRole: {
                        include: { mandatoryDocuments: true }
                    },
                    documents: {
                        where: { status: 'SIGNED' }
                    }
                }
            });

            if (!employee) return this.error(null, 'Colaborador não encontrado.');

            const mandatoryDocs = employee.jobRole?.mandatoryDocuments || [];
            const signedDocs = employee.documents || [];

            const pendingDocs = mandatoryDocs
                .filter(m => !signedDocs.some(s => s.type === m.title)) // Basic match by title/type
                .map(m => m.title);

            const total = mandatoryDocs.length;
            const signed = mandatoryDocs.length - pendingDocs.length;
            const score = total > 0 ? (signed / total) * 100 : 100;

            return this.success({
                employeeId: employee.id,
                employeeName: employee.name,
                totalMandatory: total,
                totalSigned: signed,
                complianceScore: score,
                pendingDocs
            });
        } catch (error) {
            return this.error(error, 'Erro ao calcular conformidade.');
        }
    }

    /**
     * Get mandatory documents for a role
     */
    static async getRoleRequirements(roleId: string) {
        return await prisma.mandatoryDocument.findMany({
            where: { jobRoleId: roleId }
        });
    }

    /**
     * Define a mandatory document for a role
     */
    static async setMandatoryDoc(data: { title: string, category: string, jobRoleId: string }) {
        try {
            const doc = await prisma.mandatoryDocument.create({
                data
            });
            return this.success(doc);
        } catch (error) {
            return this.error(error, 'Erro ao definir documento obrigatório.');
        }
    }
}
