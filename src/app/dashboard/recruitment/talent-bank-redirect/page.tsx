
import { getTalentBankJob } from '@/modules/recruitment/actions/jobs';
import { redirect } from 'next/navigation';

export default async function TalentBankRedirect() {
    const { data: talentBank } = await getTalentBankJob();

    if (talentBank) {
        redirect(`/dashboard/recruitment/${talentBank.id}`);
    }

    redirect('/dashboard/recruitment');
}
