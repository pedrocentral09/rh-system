'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, PlaneTakeoff, PlaneLanding, Palmtree, History as HistoryIcon, Activity, FileEdit, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { parseSafeDate } from '@/shared/utils/date-utils';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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
        <div className="flex flex-col h-full bg-surface border border-white/5 rounded-[2.5rem] p-10 overflow-hidden relative group shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)]">
            {/* Ambient Background Light */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/[0.03] blur-[120px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="absolute -left-20 -bottom-20 w-48 h-48 bg-white/[0.01] blur-[80px] rounded-full" />

            <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-[0_0_10px_#FF7800]" />
                        <h3 className="text-[10px] font-[1000] text-text-muted uppercase tracking-[0.4em] italic">Cronograma Operacional</h3>
                    </div>
                    <h2 className="text-3xl font-[1000] text-text-primary uppercase tracking-tighter italic leading-none">Mural de <span className="text-brand-orange">Eventos</span></h2>
                </div>
                <div className="bg-brand-orange/10 text-brand-orange px-4 py-1.5 rounded-full text-[9px] font-[1000] uppercase tracking-[0.2em] border border-brand-orange/20 shadow-lg">
                    {events.length} ATIVOS
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-3 space-y-5 custom-scrollbar relative z-10">
                {events.map((event, index) => {
                    const date = parseSafeDate(event.date)!;

                    let bgClass = 'bg-surface-secondary/40 backdrop-blur-md border-white/5';
                    let icon = <Calendar className="h-4 w-4" />;
                    let accentColor = 'text-brand-orange';
                    let glowColor = 'hover:border-brand-orange/30 hover:shadow-brand-orange/5';

                    if (event.type === 'holiday') {
                        bgClass = 'bg-emerald-500/[0.03] backdrop-blur-md border-emerald-500/10';
                        icon = <Palmtree className="h-5 w-5 text-emerald-500" />;
                        accentColor = 'text-emerald-400';
                        glowColor = 'hover:border-emerald-500/30 hover:shadow-emerald-500/5';
                    } else if (event.type === 'vacation_start') {
                        bgClass = 'bg-orange-500/[0.03] backdrop-blur-md border-orange-500/10';
                        icon = <PlaneTakeoff className="h-5 w-5 text-orange-500" />;
                        accentColor = 'text-orange-400';
                        glowColor = 'hover:border-orange-500/30 hover:shadow-orange-500/5';
                    } else if (event.type === 'vacation_end') {
                        bgClass = 'bg-sky-500/[0.03] backdrop-blur-md border-sky-500/10';
                        icon = <PlaneLanding className="h-5 w-5 text-sky-500" />;
                        accentColor = 'text-sky-400';
                        glowColor = 'hover:border-sky-500/30 hover:shadow-sky-500/5';
                    } else if (event.type === 'aso_expiration' || event.type === 'medical_return') {
                        bgClass = 'bg-rose-500/[0.03] backdrop-blur-md border-rose-500/10';
                        icon = <Activity className="h-5 w-5 text-rose-500" />;
                        accentColor = 'text-rose-400';
                        glowColor = 'hover:border-rose-500/30 hover:shadow-rose-500/5';
                    }

                    const getEventLink = () => {
                        if (event.type === 'holiday' || !event.employeeId) return null;
                        if (event.type === 'vacation_start' || event.type === 'vacation_end') return `/dashboard/vacations?employeeId=${event.employeeId}`;
                        return `/dashboard/personnel?id=${event.employeeId}`;
                    };

                    const eventLink = getEventLink();

                    const content = (
                        <div className={cn(
                            "group/item relative flex items-center gap-5 p-5 rounded-[2rem] border transition-all duration-500 hover:bg-surface",
                            bgClass,
                            glowColor
                        )}>
                            <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-white/5 pr-5">
                                <span className={cn("text-[10px] font-[1000] uppercase tracking-widest leading-none mb-1", accentColor)}>
                                    {format(date, 'MMM', { locale: ptBR })}
                                </span>
                                <span className="text-3xl font-[1000] text-text-primary leading-none tracking-tighter">
                                    {format(date, 'dd')}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-1.5 rounded-lg bg-surface flex items-center justify-center shadow-inner border border-white/5 group-hover/item:border-brand-orange/20 transition-all duration-700">
                                        {icon}
                                    </div>
                                    <span className={cn("text-[10px] font-[1000] uppercase tracking-[0.2em] leading-none truncate", accentColor)}>
                                        {event.title}
                                    </span>
                                </div>

                                {event.employee ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-xl bg-surface border border-white/5 overflow-hidden flex-shrink-0 shadow-lg relative group-hover/item:border-brand-orange/40 transition-all duration-700 group-hover:rotate-6">
                                            {event.photoUrl ? (
                                                <img src={event.photoUrl} alt={event.employee} className="h-full w-full object-cover group-hover/item:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <span className="text-[11px] font-[1000] h-full w-full flex items-center justify-center uppercase text-text-muted group-hover/item:text-brand-orange transition-colors italic">
                                                    {event.employee.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[13px] font-[1000] text-text-primary truncate uppercase tracking-tight group-hover/item:text-brand-orange transition-colors duration-500 italic">
                                            {event.employee}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-[1000] text-text-muted uppercase tracking-widest">
                                            Operação Corporativa
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="h-8 w-8 rounded-full border border-white/5 flex items-center justify-center opacity-0 group-hover/item:opacity-100 group-hover/item:bg-brand-orange transition-all duration-500 group-hover/item:rotate-[-45deg]">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-white"><path d="M5 12h14m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="4" /></svg>
                            </div>
                        </div>
                    );

                    return (
                        <motion.div
                            key={`${event.type}-${event.date}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05, duration: 0.8, ease: "circOut" }}
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
