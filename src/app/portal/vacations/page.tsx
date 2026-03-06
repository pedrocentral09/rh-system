
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import { getVacationData, checkVacationRights } from '@/modules/vacations/actions';
import { EmployeeVacationPortal } from '@/modules/vacations/components/EmployeeVacationPortal';
import { Palmtree, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalVacationsPage() {
    const user = await getCurrentUser();
    if (!user) return <div className="p-6 text-center text-red-500 font-bold bg-white rounded-2xl shadow-sm">Não autorizado</div>;

    const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true }
    });

    if (!employee) return <div className="p-6 text-center text-red-500 font-bold bg-white rounded-2xl shadow-sm">Colaborador não encontrado</div>;

    let result = await getVacationData(employee.id);
    let periods = result.success ? result.data : [];

    // If no periods found, try to calculate rights (first access or data integrity check)
    if (!periods || periods.length === 0) {
        await checkVacationRights(employee.id, false);
        result = await getVacationData(employee.id);
        periods = result.success ? (result.data || []) : [];
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/portal" className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Férias</h1>
                    <p className="text-sm text-slate-500 font-medium">Acompanhe seus períodos aquisitivos e solicite folga.</p>
                </div>
            </div>

            <EmployeeVacationPortal periods={(periods as any) || []} />
        </div>
    );
}
