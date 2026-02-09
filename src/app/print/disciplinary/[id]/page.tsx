
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DisciplinaryPrintView } from '@/modules/disciplinary/components/DisciplinaryPrintView';
import { PrintTrigger } from '@/app/dashboard/time-tracking/print/PrintTrigger';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PrintDisciplinaryPage(props: Props) {
    const params = await props.params;

    const record = await prisma.disciplinaryRecord.findUnique({
        where: { id: params.id },
        include: { employee: true }
    });

    if (!record) return notFound();

    // Mock Company
    const company = {
        name: 'EMPRESA EXEMPLO LTDA',
        city: 'São Paulo',
        state: 'SP'
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none">
                <div className="mb-4 print:hidden flex justify-between items-center no-print">
                    <h1 className="text-xl font-bold">Documento Disciplinar</h1>
                    <PrintTrigger />
                </div>

                <DisciplinaryPrintView
                    record={record}
                    employee={record.employee}
                    company={company}
                />
            </div>
        </div>
    );
}
