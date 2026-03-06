import { getRewardCatalog, getAllMissions } from '@/modules/rewards/actions/coins';
import { requireAuth } from '@/modules/core/actions/auth';
import { RewardCatalogManager } from '@/modules/rewards/components/RewardCatalogManager';
import { MissionManager } from '@/modules/rewards/components/MissionManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import Link from 'next/link';

export default async function FamiliaCoinsPage() {
    await requireAuth(['ADMIN', 'HR', 'MANAGER']);

    const [catalogResult, missionsResult] = await Promise.all([
        getRewardCatalog(true),
        getAllMissions(),
    ]);

    const catalog = catalogResult.data || [];
    const missions = missionsResult.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🪙</span> Família Coins
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie o catálogo de recompensas e as missões da equipe.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/dashboard/rewards/requests"
                        className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm"
                    >
                        📋 Aprovar Resgates
                    </Link>
                    <Link
                        href="/dashboard/rewards/distribute"
                        className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 font-medium rounded-lg text-sm transition-colors shadow-sm"
                    >
                        🪙 Distribuir Moedas
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="catalogo" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <TabsTrigger value="catalogo" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        🛍️ Catálogo de Recompensas
                    </TabsTrigger>
                    <TabsTrigger value="missoes" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
                        🎯 Missões
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="catalogo" className="outline-none">
                    <RewardCatalogManager initialCatalog={catalog as any} />
                </TabsContent>

                <TabsContent value="missoes" className="outline-none">
                    <MissionManager initialMissions={missions as any} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
