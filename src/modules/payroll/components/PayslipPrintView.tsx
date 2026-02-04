


interface PayslipPrintProperties {
    payslip: any; // Relaxed type
    company: any;
}

export function PayslipPrintView({ payslip, company }: PayslipPrintProperties) {
    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(val));

    return (
        <div className="w-[210mm] bg-white text-black text-[10pt] font-sans p-8 mx-auto print:w-full print:mx-0">
            {/* Header: Company Info */}
            <div className="border border-black mb-1 p-2 flex justify-between items-start">
                <div>
                    <h1 className="font-bold text-lg uppercase">{company.name}</h1>
                    <p>{company.street}, {company.number} - {company.neighborhood}</p>
                    <p>CNPJ: {company.cnpj}</p>
                </div>
                <div className="text-right">
                    <h2 className="font-bold text-lg">RECIBO DE PAGAMENTO DE SALÁRIO</h2>
                    <p className="font-medium">Referência: {payslip.period.month.toString().padStart(2, '0')}/{payslip.period.year}</p>
                </div>
            </div>

            {/* Employee Info */}
            <div className="border border-black mb-1 p-1 grid grid-cols-4 gap-2">
                <div className="col-span-1">
                    <span className="block text-[8pt] font-bold">CÓDIGO</span>
                    <span>{payslip.employee.id.substring(0, 6).toUpperCase()}</span>
                </div>
                <div className="col-span-2">
                    <span className="block text-[8pt] font-bold">NOME DO FUNCIONÁRIO</span>
                    <span>{payslip.employee.name}</span>
                </div>
                <div className="col-span-1">
                    <span className="block text-[8pt] font-bold">CBO / CARGO</span>
                    <span>{payslip.employee.jobTitle}</span>
                </div>
            </div>

            {/* Items Table - Fixed Height for A4 Consistency */}
            <div className="border border-black mb-1 min-h-[400px] relative">
                {/* Table Header */}
                <div className="grid grid-cols-12 border-b border-black bg-gray-100 font-bold text-[8pt] p-1">
                    <div className="col-span-1 border-r border-black pl-1">CÓD</div>
                    <div className="col-span-5 border-r border-black pl-1">DESCRIÇÃO</div>
                    <div className="col-span-1 border-r border-black text-right pr-1">REF.</div>
                    <div className="col-span-2 border-r border-black text-right pr-1">VENCIMENTOS</div>
                    <div className="col-span-3 text-right pr-1">DESCONTOS</div>
                </div>

                {/* Items */}
                <div className="text-[9pt]">
                    {payslip.items.map((item: any) => (
                        <div key={item.id} className="grid grid-cols-12 leading-relaxed">
                            <div className="col-span-1 border-r border-transparent pl-2">{item.event?.code || '000'}</div>
                            <div className="col-span-5 border-r border-transparent pl-1">{item.name}</div>
                            <div className="col-span-1 border-r border-transparent text-right pr-1">{item.reference || ''}</div>
                            <div className="col-span-2 border-r border-transparent text-right pr-1">
                                {item.type === 'EARNING' ? formatCurrency(item.value) : ''}
                            </div>
                            <div className="col-span-3 text-right pr-1">
                                {item.type === 'DEDUCTION' ? formatCurrency(item.value) : ''}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Totals - Positioned at Bottom */}
                <div className="absolute bottom-0 w-full border-t border-black bg-gray-50">
                    <div className="grid grid-cols-12 font-bold text-[9pt] p-1">
                        <div className="col-span-7"></div>
                        <div className="col-span-2 text-right pr-1 border-r border-black">
                            <div className="text-[7pt]">TOTAL VENCIMENTOS</div>
                            {formatCurrency(payslip.totalAdditions)}
                        </div>
                        <div className="col-span-3 text-right pr-1">
                            <div className="text-[7pt]">TOTAL DESCONTOS</div>
                            {formatCurrency(payslip.totalDeductions)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Summary */}
            <div className="border border-black mb-8 p-1">
                <div className="grid grid-cols-5 gap-4">
                    <div>
                        <span className="block text-[7pt] font-bold">SALÁRIO BASE</span>
                        <span>{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div>
                        <span className="block text-[7pt] font-bold">BASE CALC. INSS</span>
                        <span>{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div>
                        <span className="block text-[7pt] font-bold">BASE CALC. FGTS</span>
                        <span>{formatCurrency(payslip.grossSalary)}</span>
                    </div>
                    <div>
                        <span className="block text-[7pt] font-bold">FGTS DO MÊS</span>
                        <span>{formatCurrency(Number(payslip.grossSalary) * 0.08)}</span>
                    </div>
                    <div className="bg-gray-200 p-1 border border-black text-right">
                        <span className="block text-[7pt] font-bold">LÍQUIDO A RECEBER</span>
                        <span className="font-bold text-lg">{formatCurrency(payslip.netSalary)}</span>
                    </div>
                </div>
            </div>

            {/* Signature Area */}
            <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="border-t border-black text-center pt-2">
                    <p className="text-[8pt] uppercase">{company.name}</p>
                    <p className="text-[7pt]">Assinatura do Empregador</p>
                </div>
                <div className="border-t border-black text-center pt-2">
                    <p className="text-[8pt] uppercase">{payslip.employee.name}</p>
                    <p className="text-[7pt]">Assinatura do Funcionário</p>
                    <p className="text-[7pt] mt-1">Declaro ter recebido a importância líquida discriminada neste recibo.</p>
                </div>
            </div>

            <p className="text-[7pt] text-gray-400 mt-2 text-center">Gerado por HR System em {new Date().toLocaleDateString()}</p>
        </div>
    );
}
