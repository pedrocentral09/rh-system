
import { getOnboardingProcesses, createOnboardingProcess } from '@/modules/onboarding/actions/processes';
import { OnboardingList } from '@/modules/onboarding/components/OnboardingList';
import { Button } from '@/shared/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Onboarding | Sistema RH',
};

export default async function OnboardingPage() {
    const { data: processes } = await getOnboardingProcesses();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Onboarding</h1>
                    <p className="text-slate-500 dark:text-slate-400">Acompanhe a entrada de novos colaboradores.</p>
                </div>
                {/* 
                  In the future, this button would open a modal to select a candidate.
                  For now, we assume processes are created via Recruitment or API.
                */}
            </div>

            <OnboardingList processes={processes || []} />
        </div>
    );
}
