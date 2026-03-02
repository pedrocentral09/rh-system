
import { getPayslipDetails } from '@/modules/payroll/actions/periods';
import { PayslipPrintView } from '@/modules/payroll/components/PayslipPrintView';
import { notFound } from 'next/navigation';
import { AutoArchivePrintTrigger } from '@/shared/components/AutoArchivePrintTrigger';

interface Props {
    params: Promise<{ payslipId: string }>;
}

export default async function PrintPayslipPage(props: Props) {
    const params = await props.params;
    const { data: payslip, company } = await getPayslipDetails(params.payslipId);

    if (!payslip) return notFound();

    const periodRef = `${String(payslip.period.month).padStart(2, '0')}-${payslip.period.year}`;

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none">
                <div className="mb-4 print:hidden flex justify-between items-center">
                    <h1 className="text-xl font-bold">Visualização de Impressão</h1>
                    <AutoArchivePrintTrigger
                        printAreaId="payslip-print-area"
                        fileLabel={`holerite_${payslip.employee.name.replace(/\s+/g, '_')}_${periodRef}`}
                        employeeId={payslip.employeeId}
                        employeeName={payslip.employee.name}
                        category="holerites"
                        archiveFileName={`holerite_${periodRef}.pdf`}
                    />
                </div>

                <div id="payslip-print-area">
                    <PayslipPrintView payslip={payslip} company={company} />
                </div>
            </div>
        </div>
    );
}
