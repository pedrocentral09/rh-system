
'use client';

import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';

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
                                    <h3 className="font-bold text-lg">{candidate.name}</h3>
                                    <p className="text-sm text-slate-500">{candidate.email} • {candidate.phone}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-slate-400">Cadastrado em {new Date(candidate.createdAt).toLocaleDateString()}</span>
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
                                    <a href={candidate.resumeUrl} target="_blank" className="text-sm text-indigo-600 hover:underline block font-medium">
                                        📄 Visualizar Currículo
                                    </a>
                                )}

                                <div className="pt-2 border-t mt-2">
                                    <p className="text-xs font-semibold text-slate-700 mb-1">Candidaturas:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {candidate.applications.map((app: any) => (
                                            <span key={app.id} className="text-xs bg-slate-100 px-2 py-1 rounded border">
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
