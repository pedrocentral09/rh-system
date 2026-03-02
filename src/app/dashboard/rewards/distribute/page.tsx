import { getEmployees } from '@/modules/personnel/actions/employees';
import { DistributeCoins } from '@/modules/rewards/components/DistributeCoins';
import Link from 'next/link';

export default async function RewardsDistributePage() {
    const response = await getEmployees();
    const employees = response.success ? response.data : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🪙</span> Conceder Família Coins
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Reconheça o esforço da sua equipe distribuindo moedas manualmente.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/rewards/catalog" className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium rounded-lg text-sm transition-colors border border-slate-200 shadow-sm">
                        Voltar ao Catálogo
                    </Link>
                </div>
            </div>

            <DistributeCoins employees={employees as any} />
        </div>
    );
}
