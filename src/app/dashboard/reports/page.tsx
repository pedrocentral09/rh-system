import { prisma } from '@/lib/prisma';
import { ReportCenter } from '@/modules/payroll/components/ReportCenter';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const companies = await prisma.company.findMany({ select: { id: true, name: true } });
    const stores = await prisma.store.findMany({ select: { id: true, name: true } });

    return (
        <div className="p-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div>
                <h1 className="text-4xl font-black text-slate-950 dark:text-white tracking-tighter uppercase">
                    Centro de <span className="text-orange-500">Relatórios</span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight"> Inteligência de Dados e Exportação Executiva </p>
            </div>

            <ReportCenter companies={companies} stores={stores} />
        </div>
    );
}
