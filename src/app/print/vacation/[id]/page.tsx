
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VacationNoticePrintView } from '@/modules/vacations/components/VacationNoticePrintView';
import { PrintTrigger } from '@/app/dashboard/time-tracking/print/PrintTrigger';

interface Props {
    params: Promise<{ id: string }>;
}

export default async function PrintVacationPage(props: Props) {
    const params = await props.params;

    const vacation = await prisma.vacationPeriod.findUnique({
        where: { id: params.id },
        include: { employee: true }
    });

    if (!vacation) return notFound();

    // Mock Company for now (or fetch from Settings)
    const company = {
        name: 'EMPRESA EXEMPLO LTDA',
        city: 'São Paulo',
        state: 'SP'
    };

    return (
        <div className="bg-gray-100 min-h-screen p-8 print:p-0 print:bg-white">
            <div className="max-w-[210mm] mx-auto print:max-w-none">
                <div className="mb-4 print:hidden flex justify-between items-center no-print">
                    <h1 className="text-xl font-bold">Impressão de Aviso</h1>
                    <PrintTrigger />
                </div>

                <VacationNoticePrintView
                    vacation={vacation}
                    employee={vacation.employee}
                    company={company}
                />
            </div>
        </div>
    );
}
