
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { submitApplication } from '../actions';
import { toast } from 'sonner';

export function ApplicationForm({ job }: { job: any }) {
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);

        // Append Job ID
        formData.append('jobId', job.id);

        const result = await submitApplication(formData);

        if (result.success) {
            toast.success('Candidatura enviada com sucesso! Boa sorte.');
            // Reset form or redirect
            window.location.href = '/careers?success=true';
        } else {
            toast.error(result.error || 'Erro ao enviar candidatura.');
        }
        setIsLoading(false);
    }

    return (
        <form action={handleSubmit} className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
            <h3 className="text-lg font-bold mb-4">Candidate-se agora</h3>

            <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" name="name" required placeholder="Seu nome" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="seu@email.com" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn (URL)</Label>
                <Input id="linkedin" name="linkedin" placeholder="https://linkedin.com/in/..." />
            </div>

            <div className="space-y-2">
                <Label htmlFor="resume">Currículo (PDF)</Label>
                <div className="flex items-center gap-2">
                    <label className="flex-1 cursor-pointer">
                        <div className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 hover:bg-slate-50">
                            {fileName || "Clique para anexar arquivo..."}
                        </div>
                        <input
                            type="file"
                            id="resume"
                            name="resume"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                        />
                    </label>
                </div>
                <p className="text-xs text-slate-400">* Apenas simulação de upload por enquanto.</p>
            </div>

            <Button type="submit" className="w-full bg-[#FF7800] hover:bg-orange-600 text-white mt-4" disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
        </form>
    );
}
