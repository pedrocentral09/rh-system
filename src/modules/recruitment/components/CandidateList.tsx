
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

import { motion } from 'framer-motion';

export function CandidateList({ candidates }: { candidates: any[] }) {
    const [search, setSearch] = useState('');

    const filtered = candidates.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="relative group max-w-md">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-brand-orange transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </div>
                <input
                    placeholder="PESQUISAR CANDIDATOS..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black text-white uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-brand-orange/30 transition-all shadow-xl"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((candidate, i) => (
                    <motion.div
                        key={candidate.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-indigo-500/30 transition-all duration-500 group relative overflow-hidden"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="font-black text-lg text-white uppercase tracking-tighter group-hover:text-indigo-400 transition-colors">{candidate.name}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{candidate.email} • {candidate.phone}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">{new Date(candidate.createdAt).toLocaleDateString('pt-BR')}</span>
                                {candidate.source && (
                                    <span className="text-[9px] font-black uppercase px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-tighter">
                                        {candidate.source}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {candidate.resumeUrl && (
                                    <a
                                        href={normalizeUrl(candidate.resumeUrl)}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/80 hover:bg-indigo-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 shadow-lg group/btn"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                                        Currículo
                                    </a>
                                )}
                                {candidate.linkedin && (
                                    <a
                                        href={candidate.linkedin}
                                        target="_blank"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all border border-blue-600/20 shadow-lg"
                                    >
                                        LinkedIn
                                    </a>
                                )}
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Candidaturas Ativas</p>
                                <div className="flex flex-wrap gap-2">
                                    {candidate.applications.map((app: any) => (
                                        <div key={app.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                                            <span className="text-[10px] font-black text-white uppercase tracking-tighter truncate max-w-[150px]">{app.job.title}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-600" />
                                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{app.status}</span>
                                        </div>
                                    ))}
                                    {candidate.applications.length === 0 && (
                                        <span className="text-[10px] font-bold text-slate-600 italic">Nenhuma candidatura registrada</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {filtered.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-700">
                        <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhum candidato localizado</p>
                    </div>
                )}
            </div>
        </div>
    );
}
