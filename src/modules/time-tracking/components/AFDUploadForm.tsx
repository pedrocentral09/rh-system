'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { uploadAFD } from '../actions';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

export function AFDUploadForm() {
    const [loading, setLoading] = useState(false);
    const [store, setStore] = useState('');

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (store) formData.append('store', store);

        const res = await uploadAFD(formData);

        setLoading(false);
        if (res.success) {
            toast.success(`Sucesso! ${res.count} registros importados.`, { duration: 5000 });
            window.location.reload();
        } else {
            toast.error(`Erro: ${res.error}`);
        }
    }

    return (
        <Card className="border-indigo-100 bg-indigo-50/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UploadCloud className="text-indigo-600" /> Importar AFD
                </CardTitle>
                <CardDescription>Envie o arquivo do relógio de ponto.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Loja / Unidade</label>
                        <Input
                            placeholder="Ex: Matriz"
                            value={store}
                            onChange={e => setStore(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Arquivo (.txt)</label>
                        <input
                            type="file"
                            name="file"
                            accept=".txt"
                            required
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-indigo-50 file:text-indigo-700
                                hover:file:bg-indigo-100"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {loading ? 'Processando...' : 'Enviar Arquivo'}
                    </Button>

                    <p className="text-xs text-slate-500 text-center">
                        Suporta formato Portaria 1510/671 (AFD)
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
