import { prisma } from '@/lib/prisma';
import { BaseService } from '@/lib/BaseService';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'EXPORT' | 'TERMINATE';
export type AuditModule = 'CORE' | 'PERSONNEL' | 'PAYROLL' | 'CONFIGURATION';

export class AuditService extends BaseService {
    static async log({
        userId,
        action,
        module,
        resource,
        resourceId,
        oldData,
        newData,
        ipAddress,
        userAgent
    }: {
        userId?: string;
        action: AuditAction;
        module: AuditModule;
        resource: string;
        resourceId?: string;
        oldData?: any;
        newData?: any;
        ipAddress?: string;
        userAgent?: string;
    }) {
        try {
            const log = await prisma.auditLog.create({
                data: {
                    userId,
                    action,
                    module,
                    resource,
                    resourceId,
                    oldData: oldData ? JSON.stringify(oldData) : null,
                    newData: newData ? JSON.stringify(newData) : null,
                    ipAddress,
                    userAgent
                }
            });
            return this.success(log);
        } catch (error) {
            console.error('[AuditService Error]: Failed to create log', error);
            // We don't return an error here to not break the main flow if audit fails
            return { success: false, error };
        }
    }
}
