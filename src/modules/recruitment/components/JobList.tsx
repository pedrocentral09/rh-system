"use client"

import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import Link from 'next/link';

import { motion } from 'framer-motion';

export function JobList({ jobs }: { jobs: any[] }) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {jobs.map((job, i) => (
                <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`bg-[#0A0F1C]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-brand-orange/30 transition-all duration-500 group relative overflow-hidden ${job.title === 'Banco de Talentos' ? 'ring-1 ring-indigo-500/30' : ''
                        }`}
                >
                    {/* Background Accent for Banco de Talentos */}
                    {job.title === 'Banco de Talentos' && (
                        <div className="absolute -right-20 -top-20 w-40 h-40 bg-indigo-600/10 blur-[60px] pointer-events-none" />
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <h3 className={`text-lg font-black uppercase tracking-tighter transition-colors ${job.title === 'Banco de Talentos' ? 'text-indigo-400 group-hover:text-white' : 'text-white group-hover:text-brand-orange'
                                    }`}>
                                    {job.title === 'Banco de Talentos' ? `✨ ${job.title}` : job.title}
                                </h3>
                                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${job.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                    job.status === 'DRAFT' ? 'bg-slate-500/10 text-slate-400 border-white/5' :
                                        'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {job.status}
                                </div>
                            </div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                                {job.department} <span className="mx-2 text-slate-700">•</span> {job.type} <span className="mx-2 text-slate-700">•</span> Criada em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                            </p>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6">
                            <div className="text-right">
                                <span className={`text-xl font-black block leading-none ${job.title === 'Banco de Talentos' ? 'text-indigo-400' : 'text-white'
                                    }`}>
                                    {job._count.applications}
                                </span>
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Candidatos</span>
                            </div>

                            <div className="flex gap-2">
                                <Link href={`/dashboard/recruitment/${job.id}`}>
                                    <button className="h-10 px-6 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-orange hover:text-white transition-all shadow-lg">
                                        Gerenciar
                                    </button>
                                </Link>
                                <Link href={`/dashboard/recruitment/${job.id}/edit`}>
                                    <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                        ✏️
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}

            {jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/5 flex items-center justify-center mb-6">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="opacity-20"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Nenhuma vaga disponível</p>
                </div>
            )}
        </div>
    );
}
