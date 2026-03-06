
import { getEmployeePayslips } from '@/modules/payroll/actions/employee-portal';
import { EmployeePayslipPortal } from '@/modules/payroll/components/EmployeePayslipPortal';
import { FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PortalPayslipsPage() {
    const result = await getEmployeePayslips();

    if (!result.success) {
        return (
            <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
                <p className="text-red-600 font-bold">Erro ao carregar holerites</p>
                <p className="text-red-400 text-sm mt-1">{result.error}</p>
                <Link href="/portal" className="mt-4 inline-flex items-center gap-2 text-red-600 font-bold text-sm underline">
                    Voltar para o Início
                </Link>
            </div>
        );
    }

    const payslips = result.data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/portal" className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-blue transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Meus Holerites</h1>
                    <p className="text-sm text-slate-500 font-medium">Consulte seu histórico de pagamentos.</p>
                </div>
            </div>

            <EmployeePayslipPortal payslips={payslips} />
        </div>
    );
}
