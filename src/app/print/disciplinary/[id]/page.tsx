
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DisciplinaryPrintView } from '@/modules/disciplinary/components/DisciplinaryPrintView';
import { DisciplinaryPrintActions } from '@/modules/disciplinary/components/DisciplinaryPrintActions';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PrintDisciplinaryPage(props: Props) {
    const params = await props.params;

    const record = await prisma.disciplinaryRecord.findUnique({
        where: { id: params.id },
        include: {
            employee: {
                include: {
                    contract: {
                        include: { company: true }
                    }
                }
            }
        }
    });

    if (!record) return notFound();

    const company = {
        name: record.employee?.contract?.company?.name || 'Empresa não informada',
        city: record.employee?.contract?.company?.city || '',
        state: record.employee?.contract?.company?.state || ''
    };

    const employeeName = record.employee?.name || 'funcionario';

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none">
                <div className="mb-4 print:hidden flex justify-between items-center no-print">
                    <h1 className="text-xl font-bold">Documento Disciplinar</h1>
                    <DisciplinaryPrintActions
                        employeeName={employeeName}
                        employeeId={record.employeeId}
                        recordType={record.type}
                        recordDate={record.date instanceof Date ? record.date.toISOString().split('T')[0] : String(record.date).split('T')[0]}
                    />
                </div>

                <div id="disciplinary-print-area">
                    <DisciplinaryPrintView
                        record={record}
                        employee={record.employee}
                        company={company}
                    />
                </div>
            </div>
        </div>
    );
}
