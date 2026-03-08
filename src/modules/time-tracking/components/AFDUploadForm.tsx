'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { uploadAFD } from '../actions';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';

import { motion } from 'framer-motion';

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
        <div className="bg-surface border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none transition-all group-hover:bg-indigo-500/10" />

            <div className="relative z-10 space-y-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-surface-secondary border border-border flex items-center justify-center">
                            <UploadCloud className="h-5 w-5 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Ingestão de Dados AFD</h2>
                    </div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-14">Homologação de Registros Portaria 1510/671</p>
                </div>

                <form onSubmit={handleUpload} className="space-y-6">
                    <div className="space-y-2 group/input">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4 group-focus-within/input:text-indigo-500 dark:group-focus-within/input:text-indigo-400 transition-colors">Unidade Estratégica</label>
                        <input
                            placeholder="EX: MATRIZ"
                            value={store}
                            onChange={e => setStore(e.target.value)}
                            className="h-14 w-full bg-surface-secondary border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-indigo-500/30 transition-all shadow-inner placeholder:text-text-muted/50 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4">Arquivo Fonte (.TXT)</label>
                        <div className="relative h-32 border-2 border-dashed border-border rounded-2xl hover:border-indigo-500/30 transition-all flex flex-col items-center justify-center gap-3 bg-surface-secondary cursor-pointer group/file">
                            <UploadCloud className="h-6 w-6 text-text-muted group-hover/file:text-indigo-500 dark:group-hover/file:text-indigo-400 transition-colors" />
                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest group-hover/file:text-text-secondary transition-colors">Arraste ou selecione o arquivo base</span>
                            <input
                                type="file"
                                name="file"
                                accept=".txt"
                                required
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="h-14 w-full rounded-2xl bg-text-primary text-background text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                        {loading ? 'PROCESSANDO LOTE...' : 'DISPARAR IMPORTAÇÃO'}
                    </button>

                    <div className="flex items-center justify-center gap-4 py-2 opacity-30">
                        <div className="h-px w-8 bg-text-muted" />
                        <p className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center">
                            PADRÃO PORTARIA 671 COMPLIANCE
                        </p>
                        <div className="h-px w-8 bg-text-muted" />
                    </div>
                </form>
            </div>
        </div>
    );
}
