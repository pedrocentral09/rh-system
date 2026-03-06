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
import { Sparkles, ArrowRight } from 'lucide-react';

interface TalentBankCardProps {
    talentBank: any;
}

export function TalentBankCard({ talentBank }: TalentBankCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-r from-[#FF7800] to-orange-500 shadow-[0_0_80px_rgba(255,120,0,0.2)] p-1 group">
            {/* Inner Dark Card with glass effect */}
            <div className="bg-[#0A0F1C]/90 backdrop-blur-xl rounded-[2.8rem] p-8 md:p-12 h-full flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-brand-orange/20 blur-[100px] pointer-events-none group-hover:bg-brand-orange/30 transition-all duration-700" />

                <div className="space-y-4 text-center md:text-left relative z-10 flex-1">
                    <div className="inline-flex items-center justify-center gap-2 bg-brand-orange/10 text-brand-orange px-4 py-2 rounded-full border border-brand-orange/20 mb-2">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Conexão Contínua</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white uppercase">Não encontrou a <span className="text-brand-orange">vaga ideal?</span></h2>
                    <p className="text-slate-400 font-medium text-sm md:text-base max-w-xl">
                        Cadastre seu currículo em nosso banco de talentos! Estamos sempre monitorando a base prioritária em busca de talentos excepcionais.
                    </p>
                </div>

                <div className="relative z-10 w-full md:w-auto shrink-0">
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <button className="w-full md:w-auto h-16 px-10 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-orange-600 transition-all shadow-[0_0_30px_rgba(255,120,0,0.4)] flex items-center justify-center gap-3 hover:-translate-y-1">
                                Enviar Currículo <ArrowRight className="w-4 h-4 ml-2" />
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] p-0 border border-white/10 bg-[#0A0F1C]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                            <DialogHeader className="hidden">
                                <DialogTitle>Banco de Talentos</DialogTitle>
                            </DialogHeader>

                            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/10 blur-[100px] pointer-events-none rounded-full -mr-32 -mt-32" />

                            <div className="p-10 relative z-10">
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                                    Banco de <span className="text-brand-orange">Talentos</span>
                                </h3>
                                <p className="text-slate-400 text-xs mb-8 font-medium">
                                    Preencha os dados de forma detalhada para acelerar o processo de triagem.
                                </p>
                                <ApplicationForm
                                    job={talentBank}
                                    onSuccess={() => setOpen(false)}
                                />
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
