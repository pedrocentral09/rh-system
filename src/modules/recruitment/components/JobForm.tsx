
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { createJob } from '../actions/jobs';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function JobForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const data = {
            title: formData.get('title'),
            department: formData.get('department'),
            type: formData.get('type'),
            description: formData.get('description'),
            salaryRangeMin: formData.get('salaryRangeMin'),
            salaryRangeMax: formData.get('salaryRangeMax'),
        };

        const result = await createJob(data);

        if (result.success) {
            toast.success('Vaga criada com sucesso!');
            router.push('/dashboard/recruitment');
        } else {
            toast.error('Erro ao criar vaga: ' + result.error);
        }
        setIsLoading(false);
    }

    return (
        <form action={handleSubmit} className="space-y-6 bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Título da Vaga</Label>
                    <Input id="title" name="title" placeholder="Ex: Desenvolvedor Senior" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Setor</Label>
                    <Input id="department" name="department" placeholder="Ex: Tecnologia" required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Contrato</Label>
                    <select
                        id="type"
                        name="type"
                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                        required
                    >
                        <option value="CLT">CLT</option>
                        <option value="PJ">PJ</option>
                        <option value="ESTAGIO">Estágio</option>
                        <option value="TEMPORARIO">Temporário</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                        <Label htmlFor="salaryRangeMin">Salário Min</Label>
                        <Input id="salaryRangeMin" name="salaryRangeMin" type="number" placeholder="0.00" step="0.01" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="salaryRangeMax">Salário Max</Label>
                        <Input id="salaryRangeMax" name="salaryRangeMax" type="number" placeholder="0.00" step="0.01" />
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Descrição da Vaga</Label>
                <textarea
                    id="description"
                    name="description"
                    rows={5}
                    className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                    placeholder="Descreva as responsabilidades e requisitos..."
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancelar
                </Button>
                <Button type="submit" className="bg-[#FF7800] hover:bg-orange-600 text-white" disabled={isLoading}>
                    {isLoading ? 'Salvando...' : 'Criar Vaga'}
                </Button>
            </div>
        </form>
    );
}
