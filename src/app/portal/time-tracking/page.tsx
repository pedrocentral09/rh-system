
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import { EmployeeTimeSheetPortal } from '@/modules/time-tracking/components/EmployeeTimeSheetPortal';
import { Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalTimeTrackingPage() {
    const user = await getCurrentUser();
    if (!user) return <div className="p-6 text-center text-red-500 font-bold bg-white rounded-2xl shadow-sm">Não autorizado</div>;

    const employee = await prisma.employee.findUnique({
        where: { userId: user.id },
        select: { id: true, name: true }
    });

    if (!employee) return <div className="p-6 text-center text-red-500 font-bold bg-white rounded-2xl shadow-sm">Colaborador não encontrado</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/portal" className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Espelho de Ponto</h1>
                    <p className="text-sm text-slate-500 font-medium">Acompanhe seus horários e banco de horas.</p>
                </div>
            </div>

            <EmployeeTimeSheetPortal employeeId={employee.id} />
        </div>
    );
}
