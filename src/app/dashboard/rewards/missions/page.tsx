import { getAllMissions } from '@/modules/rewards/actions/coins';
import { MissionManager } from '@/modules/rewards/components/MissionManager';
import { requireAuth } from '@/modules/core/actions/auth';
import { redirect } from 'next/navigation';

export const metadata = {
    title: 'Gerenciar Missões | Família Coins',
};

export default async function MissionsAdminPage() {
    const user = await requireAuth();
    if (!user) redirect('/login');

    const result = await getAllMissions();
    const missions = result.data || [];

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="text-3xl">🎯</span> Missões (Família Coins)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Crie tarefas ou desafios para sua equipe. Eles receberão as Família Coins automaticamente após a aprovação do envio.
                    </p>
                </div>
            </div>

            <MissionManager initialMissions={missions as any} />
        </div>
    );
}
