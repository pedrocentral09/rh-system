
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';
import { ClimateSurveyWidget } from '@/modules/performance/components/ClimateSurveyWidget';
import { getEmployeeCoinBalance } from '@/modules/rewards/actions/coins';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';
import {
    Clock,
    TrendingUp,
    FileText,
    Calendar,
    Award,
    ArrowRight,
    BellRing,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';
import { getVacationData, checkVacationRights } from '@/modules/vacations/actions';
import { getEmployeePayslips } from '@/modules/payroll/actions/employee-portal';
import { getEmployeeCareerPath } from '@/modules/career/actions/employee-career';
import PortalHomeV2 from '@/modules/core/components/PortalHomeV2';

export default async function PortalHome() {
    // Auth & Employee Data
    const user = await getCurrentUser();
    let employee = null;
    let employeeName = "Funcionário";
    let coinBalance = 0;

    if (user) {
        employee = await prisma.employee.findUnique({
            where: { userId: user.id },
            include: { jobRole: true, contract: { include: { store: true } } }
        });
        if (employee) {
            employeeName = employee.name.split(' ')[0];
            const balanceResult = await getEmployeeCoinBalance(employee.id);
            if (balanceResult.success && balanceResult.data) {
                coinBalance = balanceResult.data.balance;
            }
        }
    }

    // Dynamic Data for UX
    let hoursBalance = "00:00";
    let hoursBalanceRaw = 0;
    let nextVacation = "Sem previsão";
    let lastPayslipDate = "Indisponível";
    let careerData = null;

    if (employee) {
        const now = new Date();

        // 1. Get Hours Balance (Current Month)
        const sheetResult = await getTimeSheet(employee.id, now.getUTCMonth(), now.getUTCFullYear());
        if (sheetResult.success && sheetResult.data) {
            const mins = sheetResult.data.totalBalance;
            hoursBalanceRaw = mins;
            const h = Math.floor(Math.abs(mins) / 60);
            const m = Math.abs(mins) % 60;
            const sign = mins < 0 ? '-' : '+';
            hoursBalance = `${sign}${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }

        // 2. Get Next Vacation
        let vacationResult = await getVacationData(employee.id);
        let periods = vacationResult.success ? (vacationResult.data || []) : [];

        // If no periods found, try to calculate rights (first access or data integrity check)
        if (vacationResult.success && vacationResult.data?.length === 0) {
            await checkVacationRights(employee.id, false);
            vacationResult = await getVacationData(employee.id);
            periods = vacationResult.success ? (vacationResult.data || []) : [];
        }

        if (periods.length > 0) {
            const nextPeriod = periods.find(p => p.status === 'OPEN' || p.status === 'ACCRUING');
            if (nextPeriod) {
                nextVacation = new Date(nextPeriod.startDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            }
        }

        // 3. Get Last Payslip
        const payslipResult = await getEmployeePayslips();
        if (payslipResult.success && payslipResult.data && payslipResult.data.length > 0) {
            const last = payslipResult.data[0] as any;
            lastPayslipDate = `${last.period.month.toString().padStart(2, '0')}/${last.period.year}`;
        }

        // 4. Get Career Data
        const careerResult = await getEmployeeCareerPath();
        if (careerResult.success) {
            careerData = careerResult.data;
        }
    }

    return (
        <PortalHomeV2
            employeeName={employeeName}
            jobRole={employee?.jobRole?.name || 'Colaborador'}
            storeName={employee?.contract?.store?.name || 'Rede Família'}
            coinBalance={coinBalance}
            hoursBalance={hoursBalance}
            nextVacation={nextVacation}
            lastPayslipDate={lastPayslipDate}
            hoursBalanceRaw={hoursBalanceRaw}
            careerData={careerData}
        />
    );
}
