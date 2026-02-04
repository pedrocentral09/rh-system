
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';
import { getEmployees, getEmployee } from '@/modules/personnel/actions/employees'; // Import getEmployee/s
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { PrintTrigger } from './PrintTrigger';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintPageProps {
    searchParams: Promise<{
        employeeId?: string;
        month: string;
        year: string;
        bulk?: string;
    }>;
}

export default async function PrintTimeSheetPage(props: PrintPageProps) {
    const searchParams = await props.searchParams;
    const { employeeId, month, year, bulk } = searchParams;

    // Validation: 
    // Case 1: Single Mode -> Needs employeeId + month + year
    // Case 2: Bulk Mode -> Needs bulk='true' + month + year
    const isValid = (employeeId && month && year) || (bulk === 'true' && month && year);

    if (!isValid) {
        return (
            <div className="flex h-screen items-center justify-center text-red-600 font-bold">
                Parâmetros inválidos. Necessário (Funcionário + Data) ou (Modo Lote + Data).
            </div>
        );
    }

    const monthInt = parseInt(month);
    const yearInt = parseInt(year);

    // Fetch Company Profile
    const companySettings = await prisma.companySettings.findUnique({ where: { key: 'COMPANY_PROFILE' } });
    let company = {
        name: 'EMPRESA PADRÃO LTDA',
        cnpj: '00.000.000/0001-00',
        address: 'Endereço não configurado'
    };

    if (companySettings?.value) {
        try {
            const parsed = JSON.parse(companySettings.value);
            company = {
                name: parsed.companyName || company.name,
                cnpj: parsed.cnpj || company.cnpj,
                address: `${parsed.address?.street}, ${parsed.address?.number} - ${parsed.address?.city}/${parsed.address?.state}`
            };
        } catch { }
    }

    // Determine Employees to Print
    let employeesToPrint: any[] = [];

    if (bulk === 'true') {
        const res = await getEmployees();
        // Filter active only
        employeesToPrint = (res.data || []).filter((e: any) => e.status === 'ACTIVE');
    } else if (employeeId) {
        const res = await getEmployee(employeeId);
        if (res.data) {
            employeesToPrint = [res.data];
        } else {
            return notFound();
        }
    }

    // Helper: Format Minutes
    const formatMinutes = (mins: number) => {
        if (!mins) return '00:00';
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '';
        return `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // Render Function (to reuse layout)
    const renderSheet = async (employee: any, index: number) => {
        // Fetch TimeSheet for this employee
        const result = await getTimeSheet(employee.id, monthInt - 1, yearInt);
        const data = result.success && result.data ? result.data : null;

        if (!data) return <div key={employee.id} className="p-4 border-b">Erro ao carregar dados de {employee.name}</div>;

        const { days, totalBalance } = data;

        return (
            <div key={employee.id} className={`max-w-[210mm] mx-auto p-[10mm] print:p-0 bg-white ${index < employeesToPrint.length - 1 ? 'break-after-page' : ''}`}>
                {/* Header */}
                <header className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold uppercase">{company.name}</h1>
                        <p className="text-xs mt-1">{company.address}</p>
                        <p className="text-xs font-mono">CNPJ: {company.cnpj}</p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-lg font-bold uppercase border px-4 py-1 border-black inline-block bg-gray-100">
                            Folha de Ponto
                        </h2>
                        <p className="mt-2 text-sm font-medium">Competência: {month.toString().padStart(2, '0')}/{year}</p>
                        <p className="text-xs text-gray-500">Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </header>

                {/* Employee Info Grid */}
                <div className="grid grid-cols-4 gap-x-4 gap-y-2 mb-6 border border-black p-3 bg-gray-50/50">
                    <div className="col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-gray-600">Funcionário</label>
                        <div className="text-sm font-bold truncate">{employee.name}</div>
                    </div>
                    <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-600">Matrícula</label>
                        <div className="text-xs">{employee.id.slice(0, 8).toUpperCase()}</div>
                    </div>
                    <div>
                        <label className="block text-[9px] uppercase font-bold text-gray-600">Admissão</label>
                        <div className="text-xs">
                            {employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('pt-BR') : '-'}
                        </div>
                    </div>

                    <div className="col-span-2">
                        <label className="block text-[9px] uppercase font-bold text-gray-600">Cargo</label>
                        <div className="text-xs">{employee.jobTitle}</div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[9px] uppercase font-bold text-gray-600">Departamento</label>
                        <div className="text-xs">{employee.department}</div>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-[9px] uppercase font-bold text-gray-600">PIS</label>
                        <div className="text-xs font-mono">{employee.pis || '-'}</div>
                    </div>
                </div>

                {/* Main Table */}
                <div className="mb-6">
                    <table className="w-full border-collapse border border-black text-center text-[10px]">
                        <thead>
                            <tr className="bg-gray-200 uppercase tracking-tighter font-bold">
                                <th className="border border-black py-1 px-1 w-8">Dia</th>
                                <th className="border border-black py-1 px-1 w-16">Semana</th>
                                <th className="border border-black py-1 px-2">Expediente</th>
                                <th className="border border-black py-1 px-2 w-48">Entradas / Saídas</th>
                                <th className="border border-black py-1 px-2 bg-gray-100">Horas Trab.</th>
                                <th className="border border-black py-1 px-2 bg-gray-100">Crédito</th>
                                <th className="border border-black py-1 px-2 bg-gray-100">Débito</th>
                                <th className="border border-black py-1 px-2">Assinatura</th>
                            </tr>
                        </thead>
                        <tbody>
                            {days.map((day: any) => {
                                const dateObj = new Date(yearInt, monthInt - 1, day.day);
                                const dayOfWeek = format(dateObj, 'EEE', { locale: ptBR }).toUpperCase();
                                const isWeekEnd = day.isWeekend;
                                const isHoliday = false;
                                const rowBg = isWeekEnd || isHoliday ? 'bg-gray-100' : '';
                                const credit = day.balanceMinutes > 0 ? formatMinutes(day.balanceMinutes) : '';
                                const debit = day.balanceMinutes < 0 ? formatMinutes(Math.abs(day.balanceMinutes)) : '';

                                return (
                                    <tr key={day.day} className={`${rowBg}`}>
                                        <td className="border border-black py-1 font-bold">{day.day}</td>
                                        <td className="border border-black py-1 text-[9px]">{dayOfWeek}</td>
                                        <td className="border border-black py-1 text-[9px] overflow-hidden truncate max-w-[80px]">
                                            {day.shiftName || (isWeekEnd ? 'DSR' : 'Folga')}
                                        </td>
                                        <td className="border border-black py-1 px-2 text-left font-mono text-[10px]">
                                            {day.punches.length > 0 ? day.punches.join(' - ') : '-'}
                                        </td>
                                        <td className="border border-black py-1">{formatMinutes(day.workedMinutes)}</td>
                                        <td className="border border-black py-1 text-green-700 font-medium">{credit}</td>
                                        <td className="border border-black py-1 text-red-700 font-medium">{debit}</td>
                                        <td className="border border-black py-1"></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-black font-bold bg-gray-200">
                                <td colSpan={4} className="border border-black py-2 px-4 text-right uppercase text-xs">Totais Gerais:</td>
                                <td className="border border-black py-2 px-2">-</td>
                                <td className="border border-black py-2 px-2 text-green-800">
                                    {totalBalance > 0 ? formatMinutes(totalBalance) : ''}
                                </td>
                                <td className="border border-black py-2 px-2 text-red-800">
                                    {totalBalance < 0 ? formatMinutes(Math.abs(totalBalance)) : ''}
                                </td>
                                <td className="border border-black"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Footer / Declarations */}
                <div className="text-[10px] space-y-4">
                    <p className="text-justify leading-snug">
                        Declaro ter recebido o demonstrativo acima, conferindo a exatidão dos registros de entrada e saída, bem como o saldo de horas apurado, não tendo nada a reclamar sobre o mesmo.
                    </p>

                    <div className="grid grid-cols-2 gap-12 mt-12">
                        <div className="text-center">
                            <div className="border-t border-black w-3/4 mx-auto pt-1 mb-1"></div>
                            <p className="font-bold uppercase">{company.name}</p>
                            <p className="text-[9px]">Assinatura do Empregador</p>
                        </div>
                        <div className="text-center">
                            <div className="border-t border-black w-3/4 mx-auto pt-1 mb-1"></div>
                            <p className="font-bold uppercase">{employee.name}</p>
                            <p className="text-[9px]">Assinatura do Funcionário</p>
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-gray-300 flex justify-between text-[9px] text-gray-500">
                        <span>Sistema de RH - Gerado em {new Date().toLocaleDateString('pt-BR')}</span>
                        <span>Página 1 of 1</span>
                    </div>
                </div>
            </div>
        );
    };

    // Parallel Fetching for Performance
    // Note: React Server Components allow async map Promise.all
    const sheets = await Promise.all(employeesToPrint.map((emp, i) => renderSheet(emp, i)));

    return (
        <div className="bg-gray-100 min-h-screen text-black font-sans text-[11px] leading-tight print:bg-white print:p-0">
            <style>{`
                @page { size: A4; margin: 10mm; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; background-color: white !important; }
                    .no-print { display: none !important; }
                    .break-after-page { break-after: page; }
                }
            `}</style>

            <div className="no-print p-4 bg-slate-800 text-white flex justify-between items-center sticky top-0 z-50 shadow-md">
                <div className="text-sm">
                    <strong>Modo de Impressão</strong> &bull; {employeesToPrint.length} Folha(s) gerada(s).
                </div>
                <div className="hidden">
                    {/* Print handled by PrintTrigger */}
                </div>
            </div>

            {/* Render all sheets */}
            {sheets}

            <PrintTrigger />
        </div>
    );
}
