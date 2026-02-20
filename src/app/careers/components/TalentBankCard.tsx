
"use client";

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/shared/components/ui/dialog';
import { ApplicationForm } from './ApplicationForm';

interface TalentBankCardProps {
    talentBank: any;
}

export function TalentBankCard({ talentBank }: TalentBankCardProps) {
    const [open, setOpen] = useState(false);

    return (
        <Card className="bg-[#FF7800] border-none shadow-xl overflow-hidden group">
            <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white text-center md:text-left">
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold tracking-tight">Não encontrou a vaga ideal?</h2>
                    <p className="text-orange-50 font-medium text-lg max-w-xl">
                        Cadastre seu currículo em nosso banco de talentos! Estamos sempre de olho em novos talentos para o nosso time.
                    </p>
                </div>

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#001B3D] hover:bg-slate-900 border-none text-white font-bold py-6 px-8 text-lg rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap">
                            Cadastrar Currículo
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] p-0 border-none bg-transparent">
                        <DialogHeader className="hidden">
                            <DialogTitle>Banco de Talentos</DialogTitle>
                        </DialogHeader>
                        <div className="bg-white p-8 rounded-3xl shadow-2xl">
                            <h3 className="text-2xl font-black text-[#001B3D] uppercase tracking-tight mb-6">
                                Banco de <span className="text-[#FF7800]">Talentos</span>
                            </h3>
                            <p className="text-slate-500 text-sm mb-6 font-medium">
                                Preencha os dados abaixo para entrar em nossa base prioritária de currículos.
                            </p>
                            <ApplicationForm
                                job={talentBank}
                                onSuccess={() => setOpen(false)}
                            />
                        </div>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
