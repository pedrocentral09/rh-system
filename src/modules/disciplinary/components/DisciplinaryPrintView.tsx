
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
    record: any;
    employee: any;
    company: any;
}

export function DisciplinaryPrintView({ record, employee, company }: Props) {
    const isSuspension = record.type === 'SUSPENSION';
    const title = isSuspension ? 'COMUNICADO DE SUSPENSÃO DISCIPLINAR' : 'ADVERTÊNCIA DISCIPLINAR';

    // Dynamic text based on type
    const textOpening = isSuspension
        ? `Vimos pela presente comunicar-lhe que, a partir desta data, fica V. Sa. SUSPENSO(A) de suas funções por ${record.deductionDays || 1} dia(s), retornando às atividades em __________.`
        : `Vimos pela presente aplicar-lhe a pena de ADVERTÊNCIA DISCIPLINAR, em razão da falta cometida abaixo descrita.`;

    const textReason = `MOTIVO: ${record.description}`;

    const textClosing = isSuspension
        ? `Esclarecemos que a reincidência em fato análogo ou de outra natureza poderá ensejar a rescisão do seu contrato de trabalho por JUSTA CAUSA, conforme o artigo 482 da CLT.`
        : `Esperamos que esta advertência surta o efeito de corrigir o seu comportamento profissional, evitando assim a reincidência, o que poderá nos obrigar a tomar medidas mais drásticas, inclusive a SUSPENSÃO ou RESCISÃO POR JUSTA CAUSA.`;

    return (
        <div className="bg-white text-black font-serif p-12 min-h-[297mm] text-justify leading-relaxed">
            <style>{`
                @page { size: A4; margin: 20mm; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            {/* Header */}
            <div className="text-center mb-16">
                <h1 className="text-xl font-bold uppercase">{company.name}</h1>
                <p className="text-sm text-gray-600">{company.city} - {company.state}</p>
                <h2 className="text-2xl font-bold mt-12 uppercase border-b-2 border-black inline-block pb-2">{title}</h2>
            </div>

            {/* Body */}
            <div className="space-y-8 text-lg">
                <p>
                    Ao Sr(a).<br />
                    <strong>{employee.name}</strong><br />
                    Cargo: {employee.jobTitle}<br />
                    Setor: {employee.department}
                </p>

                <p>{textOpening}</p>

                <div className="bg-slate-50 border border-black p-6 font-bold uppercase">
                    {textReason}
                </div>

                <p>{textClosing}</p>

                <p>
                    Solicitamos o seu ciente na cópia deste documento.
                </p>

                <p className="text-right mt-8">
                    {company.city}, {format(new Date(record.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                </p>
            </div>

            {/* Signatures */}
            <div className="mt-24 space-y-16">
                <div className="grid grid-cols-2 gap-16">
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
                        </div>
                    </div>
                </div>

                {/* Witnesses usually needed for suspension or refusal to sign */}
                <div className="mt-12">
                    <p className="text-sm font-bold mb-8">Testemunhas (Em caso de recusa):</p>
                    <div className="grid grid-cols-2 gap-16">
                        <div className="text-center">
                            <div className="border-t border-black pt-2 w-3/4 mx-auto">
                                Nome / CPF
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-black pt-2 w-3/4 mx-auto">
                                Nome / CPF
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
