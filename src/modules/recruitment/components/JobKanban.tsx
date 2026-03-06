
'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { moveApplication } from '@/modules/recruitment/actions/candidates';
import { toast } from 'sonner';

type Application = {
    id: string;
    status: string;
    candidate: {
        name: string;
        email: string;
        resumeUrl?: string | null;
    };
    appliedAt: Date;
};

type Job = {
    id: string;
    title: string;
    applications: Application[];
};

import { motion } from 'framer-motion';

const PREMIUM_COLUMNS = [
    { id: 'NEW', title: 'Novos', color: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
    { id: 'SCREENING', title: 'Triagem', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/5' },
    { id: 'INTERVIEW', title: 'Entrevista', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5' },
    { id: 'OFFER', title: 'Proposta', color: 'border-orange-500/20 text-orange-400 bg-orange-500/5' },
    { id: 'HIRED', title: 'Contratado', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
    { id: 'REJECTED', title: 'Reprovado', color: 'border-red-500/20 text-red-400 bg-red-500/5' },
];

export function JobKanban({ job }: { job: Job }) {
    async function handleMove(appId: string, newStatus: string) {
        const result = await moveApplication(appId, newStatus);
        if (result.success) {
            toast.success('Status atualizado!');
            window.location.reload();
        } else {
            toast.error('Erro ao mover candidato');
        }
    }

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 min-h-[600px] px-2 animate-in fade-in duration-700">
            {PREMIUM_COLUMNS.map((col, i) => {
                const apps = job.applications.filter(a => a.status === col.id);

                return (
                    <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-4">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full bg-current ${col.color.split(' ')[1]}`} />
                                <h3 className="font-black text-[11px] text-white uppercase tracking-[0.2em]">{col.title}</h3>
                            </div>
                            <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                {apps.length}
                            </span>
                        </div>

                        <div className={`flex-1 rounded-[2rem] border border-white/5 ${col.color.split(' ').slice(-1)[0]} p-4 space-y-4 backdrop-blur-sm min-h-[400px]`}>
                            {apps.map((app, j) => (
                                <motion.div
                                    key={app.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: (i * 0.1) + (j * 0.05) }}
                                    className="bg-[#0A0F1C]/90 backdrop-blur-xl border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group relative shadow-xl"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-black text-[12px] text-white uppercase tracking-tight group-hover:text-brand-orange transition-colors">
                                            {app.candidate.name}
                                        </h4>
                                        {app.candidate.resumeUrl && (
                                            <a
                                                href={normalizeUrl(app.candidate.resumeUrl)}
                                                target="_blank"
                                                className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] hover:bg-brand-orange hover:text-white transition-all shadow-md"
                                                title="Ver Currículo"
                                            >
                                                📄
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-4 truncate">{app.candidate.email}</p>

                                    <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest leading-none">
                                            {new Date(app.appliedAt).toLocaleDateString('pt-BR')}
                                        </span>
                                        <div className="flex gap-1">
                                            {col.id !== 'NEW' && (
                                                <button
                                                    onClick={() => handleMove(app.id, getPrevStatus(col.id))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] hover:bg-slate-700 transition-all font-black text-slate-400"
                                                >
                                                    ←
                                                </button>
                                            )}
                                            {col.id !== 'HIRED' && (
                                                <button
                                                    onClick={() => handleMove(app.id, getNextStatus(col.id))}
                                                    className="w-6 h-6 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[10px] hover:bg-brand-orange text-white transition-all font-black"
                                                >
                                                    →
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}

                            {apps.length === 0 && (
                                <div className="h-20 flex items-center justify-center border border-white/5 border-dashed rounded-2xl opacity-20 capitalize text-[10px] font-black text-slate-500 tracking-widest">
                                    Vazio
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

const normalizeUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

function getNextStatus(current: string) {
    const idx = PREMIUM_COLUMNS.findIndex(c => c.id === current);
    return PREMIUM_COLUMNS[idx + 1]?.id || current;
}

function getPrevStatus(current: string) {
    const idx = PREMIUM_COLUMNS.findIndex(c => c.id === current);
    return PREMIUM_COLUMNS[idx - 1]?.id || current;
}
