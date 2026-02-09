
'use server';

import { registerCandidate } from '@/modules/recruitment/actions/candidates';
import { prisma } from '@/lib/prisma'; // Directly use prisma if needed for job details, or reuse getJobDetails
import { getJobDetails } from '@/modules/recruitment/actions/candidates';

export async function submitApplication(formData: FormData) {
    // This is a public action wrapping registerCandidate but handling file "upload" logic (mock for now)

    // In a real app with Firebase Storage:
    // 1. Client uploads file to Firebase -> gets URL.
    // 2. Client sends URL to this action.
    // OR
    // 1. Form sends File object -> We upload here (not supported in Server Actions directly for large files usually, better client-side).

    // For MVP: We accept a link OR we pretend to upload.
    // Since user asked to "attach curriculum", we need a File Input on frontend.
    // We will convert file to Base64 on client and send as string, or just simulate.

    // Let's assume the Client Component handles the upload or sends the Resume Link.

    return await registerCandidate({
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        linkedin: formData.get('linkedin'),
        jobId: formData.get('jobId'),
        // resumeUrl: ... 
    });
}

export async function getPublicJob(id: string) {
    return await getJobDetails(id);
}
