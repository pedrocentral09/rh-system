import { getManagerOneOnOnes } from '@/modules/performance/actions/one-on-ones';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { OneOnOneList } from '@/modules/performance/components/OneOnOneList';
import Link from 'next/link';

export default async function PerformanceOneOnOnePage() {
    const [meetingsResult, employeesResult] = await Promise.all([
        getManagerOneOnOnes(),
        getEmployees() // Ideal seria uma action `getTeamEmployees(managerId)`, mas para a v1 vamos listar todos e o Gestor escolhe
    ]);

    const meetings = meetingsResult.data || [];
    const employees = (employeesResult.success ? employeesResult.data : []) || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">☕</span> Reuniões 1-on-1
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Acompanhe o desenvolvimento contínuo da sua equipe através de bate-papos periódicos.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/performance/cycles" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Ver Ciclos
                    </Link>
                </div>
            </div>

            <OneOnOneList initialData={meetings as any} teamEmployees={employees} />
        </div>
    );
}
