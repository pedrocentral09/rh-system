
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import Link from 'next/link';
import { ClimateSurveyWidget } from '@/modules/performance/components/ClimateSurveyWidget';
import { getEmployeeCoinBalance } from '@/modules/rewards/actions/coins';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';

export default async function PortalHome() {
    // Auth & Employee Data
    const user = await getCurrentUser();
    let employeeName = "Funcionário";
    let coinBalance = 0;

    if (user) {
        const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
        if (employee) {
            employeeName = employee.name.split(' ')[0];
            const balanceResult = await getEmployeeCoinBalance(employee.id);
            if (balanceResult.success && balanceResult.data) {
                coinBalance = balanceResult.data.balance;
            }
        }
    }

    // Mock Data for MVP
    const balance = "08:45"; // Positive
    const nextVacation = "15/12/2026";
    const lastPayslip = "Janeiro/2026";

    return (
        <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-2">Olá, {employeeName}! 👋</h2>
                <p className="text-indigo-100 text-sm">Bem-vindo ao seu portal.</p>
            </div>

            {/* e-NPS Widget */}
            <ClimateSurveyWidget />

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/portal/rewards">
                    <Card className="hover:bg-amber-50 cursor-pointer transition-colors border-amber-100">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Família Coins</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                                {coinBalance} <span className="text-xl">🪙</span>
                            </div>
                            <p className="text-xs text-amber-600/70 mt-1 font-medium">Lojinha Aberta!</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/portal/time-tracking">
                    <Card className="border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 transition-colors h-full">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="text-emerald-600 mb-2">⏰ Banco Horas</div>
                            <div>
                                <span className="text-2xl font-bold text-emerald-700">+{balance}</span>
                                <p className="text-[10px] text-slate-500">Atualizado hoje</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/portal/vacations">
                    <Card className="border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition-colors h-full">
                        <CardContent className="p-4 flex flex-col justify-between h-full">
                            <div className="text-amber-600 mb-2">🏖️ Próx. Férias</div>
                            <div>
                                <span className="text-lg font-bold text-amber-700">{nextVacation}</span>
                                <p className="text-[10px] text-slate-500">Planejado</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Latest Payslip Action */}
            <Card className="border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer group">
                <Link href="/portal/payslips">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                                📄
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">Último Holerite</h3>
                                <p className="text-sm text-slate-500">{lastPayslip}</p>
                            </div>
                        </div>
                        <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                            →
                        </div>
                    </div>
                </Link>
            </Card>

            {/* Career Path Action */}
            <Card className="border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer group">
                <Link href="/portal/career">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                                🌳
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">Plano de Carreira</h3>
                                <p className="text-sm text-slate-500">Veja seu próximo passo</p>
                            </div>
                        </div>
                        <div className="text-slate-400 group-hover:translate-x-1 transition-transform">
                            →
                        </div>
                    </div>
                </Link>
            </Card>

            {/* News / Announcements (Placeholder) */}
            <div>
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-1">Comunicados</h3>
                <Card className="border-slate-100 bg-white">
                    <CardContent className="p-4">
                        <div className="flex gap-3">
                            <div className="text-2xl">📢</div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">Recesso de Fim de Ano</p>
                                <p className="text-xs text-slate-500 mt-1">Confira as datas de funcionamento da empresa.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
