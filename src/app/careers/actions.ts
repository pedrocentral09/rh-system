
'use server';

import { registerCandidatePublic } from '@/modules/recruitment/actions/candidates';
import { getPublicJobs, getPublicJobDetails } from '@/modules/recruitment/actions/jobs';

export async function submitApplication(formData: FormData) {
    return await registerCandidatePublic({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
        linkedin: formData.get('linkedin') as string,
        jobId: formData.get('jobId') as string,
        resumeUrl: formData.get('resumeUrl') as string,
    });
}

export async function getPublicJob(id: string) {
    return await getPublicJobDetails(id);
}

export async function getJobs() {
    return await getPublicJobs();
}
import { getTalentBankJob as getTalentBankJobInternal } from '@/modules/recruitment/actions/jobs';

export async function getTalentBankJob() {
    return await getTalentBankJobInternal();
}
