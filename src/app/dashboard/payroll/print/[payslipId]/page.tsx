
import { getPayslipDetails } from '@/modules/payroll/actions/periods';
import { PayslipPrintView } from '@/modules/payroll/components/PayslipPrintView';
import { notFound } from 'next/navigation';
import { PrintTrigger } from '@/app/dashboard/time-tracking/print/PrintTrigger'; // Reuse existing trigger

interface Props {
    params: Promise<{ payslipId: string }>;
}

export default async function PrintPayslipPage(props: Props) {
    const params = await props.params;
    const { data: payslip, company } = await getPayslipDetails(params.payslipId);

    if (!payslip) return notFound();

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none">
                <div className="mb-4 print:hidden flex justify-between items-center">
                    <h1 className="text-xl font-bold">Visualização de Impressão</h1>
                    <PrintTrigger />
                </div>

                <PayslipPrintView payslip={payslip} company={company} />
            </div>
        </div>
    );
}
