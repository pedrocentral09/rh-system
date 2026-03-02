import { getAllRedemptions, getPendingMissionCompletions } from '@/modules/rewards/actions/coins';
import { RequestsTabManager } from '@/modules/rewards/components/RequestsTabManager';
import Link from 'next/link';

export default async function RewardsRequestsPage() {
    const [redemptionsRes, missionsRes] = await Promise.all([
        getAllRedemptions(),
        getPendingMissionCompletions()
    ]);

    const redemptions = redemptionsRes.data || [];
    const missionCompletions = missionsRes.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">📥</span> Fila de Aprovação
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie pedidos de resgate de prêmios e aprove os comprovantes de missões concluídas.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/rewards/catalog" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Catálogo
                    </Link>
                    <Link href="/dashboard/rewards/missions" className="px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-lg text-sm transition-colors border border-blue-200 shadow-sm ml-2">
                        Missões
                    </Link>
                </div>
            </div>

            <RequestsTabManager redemptions={redemptions as any} missionCompletions={missionCompletions as any} />
        </div>
    );
}
