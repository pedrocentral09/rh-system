'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

const DEFAULT_REPORT_TEMPLATES = [
    {
        id: 'tpl_general_dossie',
        name: '📑 Dossiê Geral de Funcionários',
        description: 'Visão completa com dados pessoais, cargos e unidades.',
        fieldIds: ['name', 'cpf', 'jobRole', 'sector', 'store', 'admissionDate', 'status'],
        filters: [],
        groupBy: '',
        isDefault: true
    },
    {
        id: 'tpl_cost_provision_company',
        name: '💰 Provisão de Custos (por Empresa)',
        description: 'Analise o custo real total agrupado por razão social.',
        fieldIds: ['name', 'company', 'salary', 'cost_inss', 'cost_fgts', 'cost_13th', 'cost_vacation', 'cost_total'],
        filters: [],
        groupBy: 'company',
        isDefault: true
    },
    {
        id: 'tpl_cost_provision_store',
        name: '🏢 Provisão de Custos (por Unidade)',
        description: 'Detalhamento financeiro agrupado por loja/unidade.',
        fieldIds: ['name', 'store', 'salary', 'cost_inss', 'cost_fgts', 'cost_total'],
        filters: [],
        groupBy: 'store',
        isDefault: true
    },
    {
        id: 'tpl_compliance_audit',
        name: '🛡️ Auditoria de Conformidade',
        description: 'Status de documentos obrigatórios e conformidade legal.',
        fieldIds: ['name', 'jobRole', 'store', 'complianceScore'],
        filters: [],
        groupBy: 'store',
        isDefault: true
    }
];

export async function getReportTemplates() {
    try {
        let dbTemplates: any[] = [];
        try {
            dbTemplates = await (prisma as any).reportTemplate.findMany({
                orderBy: { createdAt: 'desc' }
            });
        } catch (dbError) {
            console.error("[getReportTemplates] DB Error:", dbError);
        }

        const allTemplates = [...DEFAULT_REPORT_TEMPLATES, ...dbTemplates];
        return { success: true, data: JSON.parse(JSON.stringify(allTemplates)) };
    } catch (error) {
        console.error("Error fetching report templates:", error);
        return { success: true, data: DEFAULT_REPORT_TEMPLATES };
    }
}

export async function createReportTemplate(data: {
    name: string;
    description?: string;
    fieldIds: string[];
    filters: any;
    groupBy?: string;
}) {
    try {
        const template = await (prisma as any).reportTemplate.create({
            data: {
                name: data.name,
                description: data.description,
                fieldIds: data.fieldIds,
                filters: data.filters,
                groupBy: data.groupBy
            }
        });
        revalidatePath('/dashboard/reports');
        return { success: true, data: template };
    } catch (error) {
        console.error("Error creating report template:", error);
        return { success: false, error: "Falha ao salvar modelo (verifique o banco de dados)" };
    }
}

export async function deleteReportTemplate(id: string) {
    try {
        await (prisma as any).reportTemplate.delete({
            where: { id }
        });
        revalidatePath('/dashboard/reports');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Falha ao excluir modelo" };
    }
}
