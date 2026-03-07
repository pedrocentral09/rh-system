import { getEmployeeCoinBalance, getRewardCatalog, getActiveMissions } from '@/modules/rewards/actions/coins';
import { getColleaguesList } from '@/modules/rewards/actions/p2p';
import { EmployeeRewardsPortal } from '@/modules/rewards/components/EmployeeRewardsPortal';
import { getCurrentUser } from '@/modules/core/actions/auth';
import { prisma } from '@/lib/prisma';

export default async function PortalRewardsPage() {
    // 1. Get Employee ID for current user
    const user = await getCurrentUser();
    if (!user) return <div className="p-6 text-center text-red-500">Não autorizado</div>;

    const employee = await prisma.employee.findUnique({ where: { userId: user.id } });
    if (!employee) return <div className="p-6 text-center text-red-500">Colaborador não encontrado</div>;

    // 2. Fetch Data
    const [balanceResult, catalogResult, missionsResult, colleaguesResult] = await Promise.all([
        getEmployeeCoinBalance(employee.id),
        getRewardCatalog(false), // Only active items for employees
        getActiveMissions(),
        getColleaguesList()
    ]);

    const balanceData = balanceResult.success && balanceResult.data
        ? balanceResult.data
        : { balance: 0, transactions: [] };

    const catalog = catalogResult.success ? catalogResult.data : [];
    const missions = missionsResult.success ? missionsResult.data : [];
    const colleagues = colleaguesResult.success ? colleaguesResult.data : [];

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-amber-500 to-amber-700 rounded-2xl p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold mb-1">Família Coins 🪙</h2>
                <p className="text-amber-100 text-sm">Seu programa de reconhecimento e recompensas.</p>
            </div>

            <EmployeeRewardsPortal
                balance={balanceData.balance}
                transactions={balanceData.transactions as any}
                catalog={catalog as any}
                missions={missions as any}
                colleagues={colleagues as any}
            />
        </div>
    );
}
