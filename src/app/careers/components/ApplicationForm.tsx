'use client';

import { useState } from 'react';
import { submitApplication } from '../actions';
import { toast } from 'sonner';
import { FileUpload } from '@/shared/components/FileUpload';
import { Loader2, Send } from 'lucide-react';

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
        <form action={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                    <label htmlFor="name" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Nome Completo</label>
                    <input
                        id="name"
                        name="name"
                        required
                        placeholder="SEU NOME"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-brand-orange/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        placeholder="SEU EMAIL"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-brand-orange/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="phone" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Telefone / WhatsApp</label>
                    <input
                        id="phone"
                        name="phone"
                        placeholder="(11) 99999-9999"
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-brand-orange/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label htmlFor="linkedin" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">LinkedIn (URL)</label>
                    <input
                        id="linkedin"
                        name="linkedin"
                        placeholder="HTTPS://LINKEDIN.COM/IN/..."
                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-brand-orange/50 focus:bg-white/10 transition-all shadow-inner"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <div className="p-1 rounded-3xl bg-white/5 border border-white/10">
                        <FileUpload
                            label="CURRÍCULO (PDF)"
                            candidateName={name}
                            onUploadComplete={setResumeUrl}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-white/5 mt-8">
                <button
                    type="submit"
                    disabled={isLoading || !resumeUrl}
                    className="w-full h-16 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange hover:text-white transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(255,120,0,0.3)] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.98]"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processando Envio...
                        </>
                    ) : (
                        <>
                            Finalizar Candidatura
                            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
