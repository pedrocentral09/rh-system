
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { DollarSign, Users, CalendarDays, AlertCircle } from 'lucide-react';

interface Period {
    id: string;
    month: number;
    year: number;
    status: string;
    _count: { payslips: number; };
}

interface PayrollStatCardsProps {
    periods: Period[];
    activeEmployeeCount: number;
}

export function PayrollStatCards({ periods, activeEmployeeCount }: PayrollStatCardsProps) {
    // Basic logic to find "Current" open period
    const openPeriod = periods.find(p => p.status === 'OPEN');
    const lastClosed = periods.find(p => p.status === 'PAID' || p.status === 'CLOSED');

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Competência Aberta
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {openPeriod ? `${openPeriod.month.toString().padStart(2, '0')}/${openPeriod.year}` : 'Nenhuma'}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {openPeriod ? `${openPeriod._count.payslips} holerites em aberto` : 'Todas finalizadas'}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Colaboradores Ativos
                    </CardTitle>
                    <Users className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        {activeEmployeeCount}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Elegíveis para folha
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Total Folha (Última)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-slate-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        R$ 0,00
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        {lastClosed ? `Ref: ${lastClosed.month}/${lastClosed.year}` : 'Sem histórico'}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 shadow-sm border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-500">
                        Pendências
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                        0
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                        Cadastros incompletos
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
