
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { registerCandidateInternal } from '../actions/candidates';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { FileUpload } from '@/shared/components/FileUpload';

export function CandidateForm({ jobId }: { jobId?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [candidateName, setCandidateName] = useState('');

    async function handleSubmit(formData: FormData) {
        if (!resumeUrl) {
            toast.error('Por favor, faça o upload do currículo');
            return;
        }

        setIsLoading(true);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            linkedin: formData.get('linkedin'),
            notes: formData.get('notes'),
            resumeUrl: resumeUrl,
            source: formData.get('source'),
            jobId: jobId // Optional: Auto-apply to this job
        };

        const result = await registerCandidateInternal(data);

        if (result.success) {
            toast.success('Candidato registrado com sucesso!');
            if (jobId) {
                router.refresh();
            } else {
                router.push('/dashboard/recruitment');
            }
        } else {
            toast.error(result.error);
        }
        setIsLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name" className="dark:text-slate-200">Nome Completo</Label>
                <Input
                    id="name"
                    name="name"
                    required
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-slate-200">Email</Label>
                <Input id="email" name="email" type="email" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-slate-200">Telefone</Label>
                    <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin" className="dark:text-slate-200">LinkedIn (URL)</Label>
                    <Input id="linkedin" name="linkedin" placeholder="https://..." />
                </div>
            </div>

            <div className="space-y-4">
                <FileUpload
                    label="Currículo (PDF)"
                    candidateName={candidateName}
                    onUploadComplete={setResumeUrl}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="source" className="dark:text-slate-200">Método de Cadastro</Label>
                <Input id="source" name="source" placeholder="Ex: LinkedIn, Indicação, Site" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes" className="dark:text-slate-200">Observações</Label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />
            </div>

            <Button type="submit" className="w-full bg-[#FF7800] hover:bg-orange-600 text-white" disabled={isLoading || !resumeUrl}>
                {isLoading ? 'Salvando...' : 'Adicionar Candidato'}
            </Button>
        </form>
    );
}
