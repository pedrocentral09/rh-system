"use client";

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/shared/components/ui/dialog';
import { ApplicationForm } from './ApplicationForm';
import { ArrowRight } from 'lucide-react';

interface ApplyJobDialogProps {
    job: any;
}

export function ApplyJobDialog({ job }: ApplyJobDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="h-14 px-8 rounded-2xl bg-brand-orange text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-orange-600 shadow-[0_0_20px_rgba(255,120,0,0.2)] hover:shadow-[0_0_30px_rgba(255,120,0,0.4)] flex items-center justify-center gap-2 hover:-translate-y-1">
                    Candidatar-se <ArrowRight className="w-4 h-4 ml-1" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 border border-white/10 bg-[#0A0F1C]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                <DialogHeader className="hidden">
                    <DialogTitle>{job.title}</DialogTitle>
                </DialogHeader>

                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/10 blur-[100px] pointer-events-none rounded-full -mr-32 -mt-32" />

                <div className="p-10 relative z-10">
                    <div className="inline-flex px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black text-brand-orange uppercase tracking-widest mb-3">
                        Vaga Operacional
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2 leading-tight">
                        {job.title}
                    </h3>
                    <p className="text-slate-400 text-xs mb-8 font-medium">
                        Preencha o formulário abaixo para enviar sua candidatura para esta oportunidade.
                    </p>
                    <ApplicationForm
                        job={job}
                        onSuccess={() => setOpen(false)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
