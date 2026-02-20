
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
        ? `Vimos pela presente comunicar-lhe que, a partir desta data, fica V. Sa. SUSPENSO(A) de suas funções por ${record.daysSuspended || 1} dia(s), retornando às atividades em __________.`
        : `Vimos pela presente aplicar-lhe a pena de ADVERTÊNCIA DISCIPLINAR, em razão da falta cometida abaixo descrita.`;

    const textReason = `MOTIVO: ${record.description}`;

    const textClosing = isSuspension
        ? `Esclarecemos que a reincidência em fato análogo ou de outra natureza poderá ensejar a rescisão do seu contrato de trabalho por JUSTA CAUSA, conforme o artigo 482 da CLT.`
        : `Esperamos que esta advertência surta o efeito de corrigir o seu comportamento profissional, evitando assim a reincidência, o que poderá nos obrigar a tomar medidas mais drásticas, inclusive a SUSPENSÃO ou RESCISÃO POR JUSTA CAUSA.`;

    return (
        <div className="bg-white text-black font-serif p-8 min-h-[297mm] text-justify leading-snug">
            <style>{`
                @page { size: A4; margin: 15mm; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; }
                }
            `}</style>

            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-lg font-bold uppercase">{company.name}</h1>
                <p className="text-xs text-gray-600">{company.city} - {company.state}</p>
                <h2 className="text-xl font-bold mt-6 uppercase border-b border-black inline-block pb-1">{title}</h2>
            </div>

            {/* Body */}
            <div className="space-y-4 text-base">
                <p>
                    Ao Sr(a).<br />
                    <strong>{employee.name}</strong><br />
                    Cargo: {employee.jobTitle} | Setor: {employee.department}
                </p>

                <p>{textOpening}</p>

                <div className="bg-slate-50 border border-black p-4 font-bold uppercase text-sm">
                    {textReason}
                </div>

                <p className="text-sm italic">{textClosing}</p>

                <p className="text-sm">
                    Solicitamos o seu ciente na cópia deste documento.
                </p>

                <p className="text-right mt-4 font-medium">
                    {company.city}, {format(new Date(record.date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                </p>
            </div>

            {/* Signatures */}
            <div className="mt-12 space-y-12">
                <div className="grid grid-cols-2 gap-12">
                    <div className="text-center">
                        <div className="border-t border-black pt-1 text-sm">
                            {company.name}<br />
                            <span className="text-[10px] uppercase font-bold text-gray-500">Empregador</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="border-t border-black pt-1 text-sm">
                            {employee.name}<br />
                            <span className="text-[10px] uppercase font-bold text-gray-500">Funcionário</span>
                        </div>
                    </div>
                </div>

                {/* Witnesses */}
                <div className="mt-8">
                    <p className="text-[10px] font-black uppercase mb-6 text-gray-400">Testemunhas (Em caso de recusa):</p>
                    <div className="grid grid-cols-2 gap-12">
                        <div className="text-center">
                            <div className="border-t border-slate-300 pt-1 w-3/4 mx-auto text-[10px]">
                                Nome / CPF
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-slate-300 pt-1 w-3/4 mx-auto text-[10px]">
                                Nome / CPF
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
