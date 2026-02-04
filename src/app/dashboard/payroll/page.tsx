
import { getPayrollPeriods } from '@/modules/payroll/actions/periods';
import { PayrollStatCards } from '@/modules/payroll/components/PayrollStatCards';
import { PeriodList } from '@/modules/payroll/components/PeriodList';
import { CreatePeriodButton } from '@/modules/payroll/components/CreatePeriodButton';

import { prisma } from '@/lib/prisma';

export default async function PayrollPage() {
    const { data: periods } = await getPayrollPeriods();
    const activeEmployeeCount = await prisma.employee.count({ where: { status: 'ACTIVE' } });

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 text-slate-800 dark:text-slate-100">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Folha de Pagamento</h1>
                    <p className="text-slate-500 mt-1">Gerencie competências, holerites e pagamentos.</p>
                </div>
                <CreatePeriodButton />
            </div>

            <PayrollStatCards periods={periods || []} activeEmployeeCount={activeEmployeeCount} />

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <PeriodList periods={periods || []} />
            </div>
        </div>
    );
}
