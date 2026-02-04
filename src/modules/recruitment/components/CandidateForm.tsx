
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { registerCandidate } from '../actions/candidates';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function CandidateForm({ jobId }: { jobId?: string }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            linkedin: formData.get('linkedin'),
            notes: formData.get('notes'),
            jobId: jobId // Optional: Auto-apply to this job
        };

        const result = await registerCandidate(data);

        if (result.success) {
            toast.success('Candidato registrado com sucesso!');
            if (jobId) {
                // Refresh to show in Kanban or list
                router.refresh();
                // Close modal logic would go here if it was a modal
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
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" required />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn (URL)</Label>
                    <Input id="linkedin" name="linkedin" placeholder="https://..." />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                />
            </div>

            <Button type="submit" className="w-full bg-[#FF7800] hover:bg-orange-600 text-white" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Adicionar Candidato'}
            </Button>
        </form>
    );
}
