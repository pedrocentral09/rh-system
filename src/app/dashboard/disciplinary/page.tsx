
import { getDisciplinaryRecords } from '@/modules/disciplinary/actions/records';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { DisciplinaryList } from '@/modules/disciplinary/components/DisciplinaryList';
import { DisciplinaryForm } from '@/modules/disciplinary/components/DisciplinaryForm';

export const dynamic = 'force-dynamic';

export default async function DisciplinaryPage() {
    const { data: records } = await getDisciplinaryRecords();
    const { data: employees } = await getEmployees({ status: 'ACTIVE' });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestão Disciplinar</h1>
                    <p className="text-slate-500 dark:text-slate-400">Controle de advertências, suspensões e feedbacks.</p>
                </div>
                <DisciplinaryForm employees={employees || []} />
            </div>

            <div className="grid gap-6 md:grid-cols-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Ocorrências (Mês)</div>
                    <div className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {records?.filter((r: any) => new Date(r.date).getMonth() === new Date().getMonth()).length || 0}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="text-sm font-medium text-slate-500">Suspensões Ativas</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">
                        {records?.filter((r: any) => r.type === 'SUSPENSION' && r.payrollStatus === 'PENDING').length || 0}
                    </div>
                </div>
            </div>

            <DisciplinaryList records={records || []} employees={employees || []} />
        </div>
    );
}
