
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

interface ApplyJobDialogProps {
    job: any;
}

export function ApplyJobDialog({ job }: ApplyJobDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-[#001B3D] hover:bg-[#FF7800] text-white font-bold px-8 py-6 rounded-xl transition-all shadow-lg hover:shadow-[#FF7800]/20">
                    Candidatar-se
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent">
                <DialogHeader className="hidden">
                    <DialogTitle>{job.title}</DialogTitle>
                </DialogHeader>
                <div className="bg-white p-8 rounded-3xl shadow-2xl">
                    <h3 className="text-2xl font-black text-[#001B3D] uppercase tracking-tight mb-2">
                        Vaga: <span className="text-[#FF7800]">{job.title}</span>
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 font-medium">
                        Preencha os dados abaixo para se candidatar a esta vaga.
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
