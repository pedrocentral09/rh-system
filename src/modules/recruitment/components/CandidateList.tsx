
'use client';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';

const normalizeUrl = (url: string | null | undefined) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export function CandidateList({ candidates }: { candidates: any[] }) {
    const [search, setSearch] = useState('');

    const filtered = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filtered.map(candidate => (
                    <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="py-4 pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{candidate.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{candidate.email} • {candidate.phone}</p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-1">
                                    <span className="text-xs text-slate-400">Cadastrado em {new Date(candidate.createdAt).toLocaleDateString()}</span>
                                    {candidate.source && (
                                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                                            {candidate.source}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="py-2 pb-4">
                            <div className="space-y-2">
                                {candidate.linkedin && (
                                    <a href={candidate.linkedin} target="_blank" className="text-sm text-blue-600 hover:underline block">
                                        LinkedIn Profile
                                    </a>
                                )}
                                {candidate.resumeUrl && (
                                    <a
                                        href={normalizeUrl(candidate.resumeUrl)}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-sm font-semibold transition-colors border border-indigo-100 dark:border-indigo-800/50"
                                    >
                                        📄 Visualizar Currículo
                                    </a>
                                )}

                                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Candidaturas:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.applications.map((app: any) => (
                                            <span key={app.id} className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">
                                                {app.job.title} ({app.status})
                                            </span>
                                        ))}
                                        {candidate.applications.length === 0 && (
                                            <span className="text-xs text-slate-400 italic">Nenhuma candidatura ativa.</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filtered.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        Nenhum candidato encontrado.
                    </div>
                )}
            </div>
        </div>
    );
}
