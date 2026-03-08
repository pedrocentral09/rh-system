
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
            <Card className="bg-surface shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Competência Aberta
                    </CardTitle>
                    <CalendarDays className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        {openPeriod ? `${openPeriod.month.toString().padStart(2, '0')}/${openPeriod.year}` : 'Nenhuma'}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        {openPeriod ? `${openPeriod._count.payslips} holerites em aberto` : 'Todas finalizadas'}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-surface shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Colaboradores Ativos
                    </CardTitle>
                    <Users className="h-4 w-4 text-brand-blue" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        {activeEmployeeCount}
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        Elegíveis para folha
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-surface shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Total Folha (Última)
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-text-muted" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        R$ 0,00
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        {lastClosed ? `Ref: ${lastClosed.month}/${lastClosed.year}` : 'Sem histórico'}
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-surface shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-text-muted">
                        Pendências
                    </CardTitle>
                    <AlertCircle className="h-4 w-4 text-brand-orange" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-text-primary">
                        0
                    </div>
                    <p className="text-xs text-text-muted mt-1">
                        Cadastros incompletos
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
