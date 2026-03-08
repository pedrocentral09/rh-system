'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, PlaneTakeoff, PlaneLanding, Palmtree, History as HistoryIcon, Activity, FileEdit, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseSafeDate } from '@/shared/utils/date-utils';
import Link from 'next/link';

interface EventMuralProps {
    events: any[];
}

export function EventMural({ events }: EventMuralProps) {
    if (!events || events.length === 0) {
        return (
            <div className="h-full flex flex-col p-8 bg-surface border border-border rounded-[2rem] items-center justify-center text-text-muted">
                <Palmtree className="h-16 w-16 mb-4 opacity-10" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-center">Nenhum evento detectado <br /> para o próximo ciclo</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-surface border border-border rounded-[2rem] p-8 overflow-hidden relative group">
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange" />
                        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Cronograma Geral</h3>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Mural de <span className="text-brand-orange">Eventos</span></h2>
                </div>
                <div className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-brand-orange/20">
                    {events.length} Ativos
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar relative z-10">
                {events.map((event, index) => {
                    const date = parseSafeDate(event.date)!;

                    let bgClass = 'bg-surface-secondary border-border/50';
                    let icon = <Calendar className="h-4 w-4" />;
                    let accentColor = 'text-text-secondary';
                    let glowColor = 'hover:border-border/80';

                    if (event.type === 'holiday') {
                        bgClass = 'bg-emerald-500/5 border-emerald-500/10';
                        icon = <Palmtree className="h-4 w-4 text-emerald-500" />;
                        accentColor = 'text-emerald-400';
                        glowColor = 'hover:border-emerald-500/40 hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    } else if (event.type === 'vacation_start') {
                        bgClass = 'bg-orange-500/5 border-orange-500/10';
                        icon = <PlaneTakeoff className="h-4 w-4 text-orange-500" />;
                        accentColor = 'text-orange-400';
                        glowColor = 'hover:border-orange-500/40 hover:shadow-[0_0_15px_rgba(249,115,22,0.1)]';
                    } else if (event.type === 'vacation_end') {
                        bgClass = 'bg-sky-500/5 border-sky-500/10';
                        icon = <PlaneLanding className="h-4 w-4 text-sky-500" />;
                        accentColor = 'text-sky-400';
                        glowColor = 'hover:border-sky-500/40 hover:shadow-[0_0_15px_rgba(14,165,233,0.1)]';
                    } else if (event.type === 'suspension_return') {
                        bgClass = 'bg-pink-500/5 border-pink-500/10';
                        icon = <HistoryIcon className="h-4 w-4 text-pink-500" />;
                        accentColor = 'text-pink-400';
                        glowColor = 'hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(236,72,153,0.1)]';
                    } else if (event.type === 'aso_expiration' || event.type === 'medical_return') {
                        bgClass = 'bg-rose-500/5 border-rose-500/10';
                        icon = <Activity className="h-4 w-4 text-rose-500" />;
                        accentColor = 'text-rose-400';
                        glowColor = 'hover:border-rose-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]';
                    }

                    const getEventLink = () => {
                        if (event.type === 'holiday' || !event.employeeId) return null;
                        if (event.type === 'vacation_start' || event.type === 'vacation_end') return `/dashboard/vacations?employeeId=${event.employeeId}`;
                        return `/dashboard/personnel?id=${event.employeeId}`;
                    };

                    const eventLink = getEventLink();

                    const content = (
                        <div className={`group/item relative flex items-center gap-4 p-4 rounded-3xl border transition-all duration-300 hover:scale-[1.02] ${bgClass} ${glowColor}`}>
                            <div className="flex flex-col items-center justify-center min-w-[45px] border-r border-border/50 pr-4">
                                <span className={`text-[9px] font-black uppercase tracking-tighter ${accentColor}`}>
                                    {format(date, 'MMM', { locale: ptBR })}
                                </span>
                                <span className="text-2xl font-black text-text-primary leading-none tracking-tighter">
                                    {format(date, 'dd')}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    {icon}
                                    <span className={`text-[10px] font-black uppercase tracking-[0.1em] ${accentColor}`}>
                                        {event.title}
                                    </span>
                                </div>

                                {event.employee ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-7 w-7 rounded-xl bg-surface border border-border overflow-hidden flex-shrink-0 shadow-sm relative group-hover/item:border-brand-orange/50 transition-colors">
                                            {event.photoUrl ? (
                                                <img src={event.photoUrl} alt={event.employee} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-black h-full w-full flex items-center justify-center uppercase text-text-muted group-hover/item:text-brand-orange transition-colors">
                                                    {event.employee.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-black text-text-secondary truncate uppercase tracking-tight group-hover/item:text-text-primary transition-colors">
                                            {event.employee}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs font-black text-text-muted group-hover/item:text-text-primary transition-colors uppercase tracking-tight">
                                        Empresa Geral
                                    </p>
                                )}
                            </div>

                            <div className="text-border group-hover/item:text-brand-orange transition-colors">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                            </div>
                        </div>
                    );

                    return (
                        <motion.div
                            key={`${event.type}-${event.date}-${index}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {eventLink ? (
                                <Link href={eventLink} className="block cursor-pointer">
                                    {content}
                                </Link>
                            ) : (
                                content
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
