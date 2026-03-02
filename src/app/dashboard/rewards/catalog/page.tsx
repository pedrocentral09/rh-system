import { getRewardCatalog } from '@/modules/rewards/actions/coins';
import { RewardCatalogManager } from '@/modules/rewards/components/RewardCatalogManager';
import Link from 'next/link';

export default async function RewardsCatalogPage() {
    const response = await getRewardCatalog(true); // Include inactive for admin
    const catalog = response.data || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🛍️</span> Catálogo de Recompensas
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gerencie os itens da lojinha Família Coins.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/rewards/requests" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Aprovar Resgates
                    </Link>
                    <Link href="/dashboard/rewards/distribute" className="px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 font-medium rounded-lg text-sm transition-colors shadow-sm">
                        🪙 Distribuir Moedas
                    </Link>
                </div>
            </div>

            <RewardCatalogManager initialCatalog={catalog as any} />
        </div>
    );
}
