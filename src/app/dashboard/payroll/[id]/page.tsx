
import { notFound } from 'next/navigation';
import { getPayrollPeriodById } from '@/modules/payroll/actions/periods';
import { PayslipList } from '@/modules/payroll/components/PayslipList';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';
import { ClosePeriodButton } from '@/modules/payroll/components/ClosePeriodButton';
import { ReopenPeriodButton } from '@/modules/payroll/components/ReopenPeriodButton';
import { SyncTimeSheetButton } from '@/modules/payroll/components/SyncTimeSheetButton';
import { RubricBreakdown } from '@/modules/payroll/components/RubricBreakdown';
import { PayrollFinancialCharts } from '@/modules/payroll/components/PayrollFinancialCharts';
import { CompanyCostBreakdown } from '@/modules/payroll/components/CompanyCostBreakdown';
import { StoreCostBreakdown } from '@/modules/payroll/components/StoreCostBreakdown';

export default async function PayrollDetailPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { data: period, error } = await getPayrollPeriodById(params.id);

    if (error || !period) {
        notFound();
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto p-6">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center space-x-2 text-sm text-slate-500 mb-1">
                        <Link href="/dashboard/payroll" className="hover:text-indigo-600 hover:underline">
                            Folha de Pagamento
                        </Link>
                        <span>/</span>
                        <span>Competência</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                        {period.month.toString().padStart(2, '0')}/{period.year}
                    </h1>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-2
                        ${period.status === 'OPEN' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                        {period.status === 'OPEN' ? 'Em Aberto' : 'Fechada'}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <SyncTimeSheetButton periodId={period.id} isClosed={period.status !== 'OPEN'} />
                    <ReopenPeriodButton periodId={period.id} isClosed={period.status !== 'OPEN'} canReopen={true} />
                    <ClosePeriodButton periodId={period.id} isClosed={period.status !== 'OPEN'} />
                </div>
            </div>

            <PayslipList
                periodId={period.id}
                status={period.status}
                payslips={period.payslips || []}
            />

            <div className="mt-8 border-t dark:border-slate-800 pt-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">Sumário de Rubricas (Período)</h3>
                <RubricBreakdown periodId={period.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 border-t dark:border-slate-800 pt-8">
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">Segmentação por Empresa</h3>
                    <CompanyCostBreakdown periodId={period.id} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">Segmentação por Loja</h3>
                    <StoreCostBreakdown periodId={period.id} />
                </div>
            </div>

            <div className="mt-8 border-t dark:border-slate-800 pt-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-tight">Análise Estratégica</h3>
                <PayrollFinancialCharts periodId={period.id} />
            </div>
        </div>
    );
}
