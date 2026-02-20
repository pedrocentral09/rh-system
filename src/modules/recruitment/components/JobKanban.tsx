
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

const COLUMNS = [
    { id: 'NEW', title: 'Novos', color: 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800/50' },
    { id: 'SCREENING', title: 'Triagem', color: 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/10 dark:border-indigo-800/50' },
    { id: 'INTERVIEW', title: 'Entrevista', color: 'bg-purple-50/50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800/50' },
    { id: 'OFFER', title: 'Proposta', color: 'bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800/50' },
    { id: 'HIRED', title: 'Contratado', color: 'bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50' },
    { id: 'REJECTED', title: 'Reprovado', color: 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50' },
];

const normalizeUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export function JobKanban({ job }: { job: Job }) {
    // Optimistic UI state could be added here

    async function handleMove(appId: string, newStatus: string) {
        const result = await moveApplication(appId, newStatus);
        if (result.success) {
            toast.success('Status atualizado!');
            // In a real app, we'd update local state or router.refresh() here 
            // but the server action usually handles revalidation.
            window.location.reload(); // Simple refresh for now to sync optimistic UI
        } else {
            toast.error('Erro ao mover candidato');
        }
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
            {COLUMNS.map(col => {
                const apps = job.applications.filter(a => a.status === col.id);

                return (
                    <div key={col.id} className={`flex-shrink-0 w-72 rounded-lg border ${col.color} p-3 flex flex-col gap-3`}>
                        <div className="flex justify-between items-center px-1">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{col.title}</h3>
                            <span className="bg-white/50 dark:bg-slate-800/50 px-2 py-0.5 rounded text-xs font-bold text-slate-600 dark:text-slate-400">
                                {apps.length}
                            </span>
                        </div>

                        <div className="flex-1 space-y-2">
                            {apps.map(app => (
                                <Card key={app.id} className="bg-white dark:bg-slate-900 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing border-slate-200/60 dark:border-slate-800/60 p-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{app.candidate.name}</span>
                                        {app.candidate.resumeUrl && (
                                            <a
                                                href={normalizeUrl(app.candidate.resumeUrl)}
                                                target="_blank"
                                                className="text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-transform"
                                                title="Ver Currículo"
                                            >
                                                📄
                                            </a>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 truncate">{app.candidate.email}</p>

                                    <div className="flex justify-end gap-1">
                                        {/* Simple Move Buttons for MVP */}
                                        {col.id !== 'NEW' && (
                                            <button
                                                onClick={() => handleMove(app.id, getPrevStatus(col.id))}
                                                className="text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 p-1 rounded px-2 border dark:border-slate-700"
                                            >
                                                ←
                                            </button>
                                        )}
                                        {col.id !== 'HIRED' && (
                                            <button
                                                onClick={() => handleMove(app.id, getNextStatus(col.id))}
                                                className="text-[10px] bg-slate-800 text-white hover:bg-slate-700 p-1 rounded px-2"
                                            >
                                                →
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function getNextStatus(current: string) {
    const idx = COLUMNS.findIndex(c => c.id === current);
    return COLUMNS[idx + 1]?.id || current;
}

function getPrevStatus(current: string) {
    const idx = COLUMNS.findIndex(c => c.id === current);
    return COLUMNS[idx - 1]?.id || current;
}
