import { getAllVacations, getEmployeeVacationSummary, getPendingVacationRequests } from '@/modules/vacations/actions';
import { VacationDashboardClient } from '@/modules/vacations/components/VacationDashboardClient';

export const dynamic = 'force-dynamic';

export default async function VacationsPage() {
    const { data: vacations } = await getAllVacations();
    const { data: summary } = await getEmployeeVacationSummary();
    const { data: pending } = await getPendingVacationRequests();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-black text-[#001B3D] dark:text-white uppercase tracking-tighter">Férias e Afastamentos</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Controle operacional e financeiro de períodos de gozo e licenças médicas.</p>
            </div>

            <VacationDashboardClient
                summary={summary || []}
                pendingRequests={pending || []}
                allVacations={vacations || []}
            />
        </div>
    );
}
