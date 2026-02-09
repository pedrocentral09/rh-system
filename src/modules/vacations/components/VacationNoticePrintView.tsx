
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    vacation: any; // Type safe later
    employee: any;
    company: any;
}

export function VacationNoticePrintView({ vacation, employee, company }: Props) {
    const formatDate = (date: Date) => format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });

    // Calculate notification date (usually 30 days before start, or just use today for duplicate)
    // For "Aviso", it should be signed 30 days before.
    // If we are printing now, we might display the "Expected Notice Date" if available, or today.
    // Let's assume today is the duplicate reprint date.

    const startDate = new Date(vacation.startDate);
    const endDate = new Date(vacation.endDate);
    const noticeDate = new Date(startDate);
    noticeDate.setDate(noticeDate.getDate() - 30); // Retroactive 30 days

    return (
        <div className="bg-white text-black font-serif p-12 min-h-[297mm] text-justify leading-relaxed">
            <style>{`
                @page { size: A4; margin: 20mm; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-xl font-bold uppercase">{company.name}</h1>
                <p className="text-sm text-gray-600">{company.city} - {company.state}</p>
                <div className="mt-8 border-b-2 border-black w-1/3 mx-auto"></div>
                <h2 className="text-2xl font-bold mt-8 uppercase tracking-widest">Aviso de Férias</h2>
            </div>

            {/* Body */}
            <div className="space-y-6 text-lg">
                <p>
                    Sr(a). <strong>{employee.name}</strong>,
                </p>

                <p>
                    Em cumprimento às disposições legais vigentes, comunicamos-lhe que suas férias serão concedidas no período abaixo relacionado:
                </p>

                <div className="my-8 border border-black p-6 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <strong>Período Aquisitivo:</strong><br />
                            {/* Assuming standard 1 year before start date roughly, or passed from backend */}
                            - a -
                        </div>
                        <div>
                            <strong>Período de Gozo:</strong><br />
                            {formatDate(startDate)} a {formatDate(endDate)} ({vacation.daysTaken} dias)
                        </div>
                        {vacation.soldDays > 0 && (
                            <div className="col-span-2 mt-2">
                                <strong>Abono Pecuniário (Venda):</strong><br />
                                {vacation.soldDays} dias
                            </div>
                        )}
                        <div className="col-span-2 mt-4 pt-4 border-t border-gray-300">
                            <strong>Retorno ao Trabalho:</strong> {formatDate(new Date(endDate.setDate(endDate.getDate() + 1)))}
                        </div>
                    </div>
                </div>

                <p>
                    Solicitamos que devolva a segunda via deste aviso devidamente assinado.
                </p>

                <p>
                    Importante: Para receber o pagamento antecipado das férias, deverá apresentar sua Carteira de Trabalho (CTPS) para as devidas anotações.
                </p>
            </div>

            {/* Signatures */}
            <div className="mt-24 grid grid-cols-2 gap-16">
                <div className="text-center">
                    <div className="border-t border-black pt-2">
                        {company.name}<br />
                        <span className="text-sm">Empregador</span>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-black pt-2">
                        {employee.name}<br />
                        <span className="text-sm">Funcionário</span>
                        <div className="text-xs mt-1 text-gray-500">Ciente em: _____ / _____ / _______</div>
                    </div>
                </div>
            </div>

            <div className="mt-24 text-xs text-center text-gray-400">
                Documento gerado eletronicamente pelo Sistema RH em {format(new Date(), 'dd/MM/yyyy HH:mm')}.
            </div>
        </div>
    );
}
