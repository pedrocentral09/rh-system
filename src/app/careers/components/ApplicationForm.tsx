'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { submitApplication } from '../actions';
import { toast } from 'sonner';
import { FileUpload } from '@/shared/components/FileUpload';

export function ApplicationForm({ job, onSuccess }: { job: any, onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');
    const [name, setName] = useState('');

    async function handleSubmit(formData: FormData) {
        if (!resumeUrl) {
            toast.error('Por favor, faça o upload do seu currículo em formato PDF/DOC');
            return;
        }

        setIsLoading(true);

        // Append Job ID and Resume URL
        formData.append('jobId', job.id);
        formData.append('resumeUrl', resumeUrl);

        const result = await submitApplication(formData);

        if (result.success) {
            toast.success('Candidatura enviada com sucesso! Boa sorte.');
            if (onSuccess) {
                onSuccess();
            } else {
                window.location.href = '/careers?success=true';
            }
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
                <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
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
                <FileUpload
                    label="Currículo (PDF)"
                    candidateName={name}
                    onUploadComplete={setResumeUrl}
                />
            </div>

            <Button type="submit" className="w-full bg-[#FF7800] hover:bg-orange-600 text-white mt-4" disabled={isLoading || !resumeUrl}>
                {isLoading ? 'Enviando...' : 'Enviar Candidatura'}
            </Button>
        </form>
    );
}
