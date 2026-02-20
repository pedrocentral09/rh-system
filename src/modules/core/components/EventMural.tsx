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
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">
                <CardHeader>
                    <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-orange-500" />
                        Mural de Eventos
                    </CardTitle>
                    <CardDescription>Próximos acontecimentos na empresa.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex flex-col items-center justify-center text-slate-400">
                    <Palmtree className="h-12 w-12 mb-2 opacity-20" />
                    <p className="text-sm font-medium">Nenhum evento agendado para os próximos 30 dias.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 text-slate-900 dark:text-white">
                            <Calendar className="h-5 w-5 text-orange-500" />
                            Mural de Eventos
                        </CardTitle>
                        <CardDescription className="text-xs font-medium dark:text-slate-400">Cronograma dos próximos 30 dias</CardDescription>
                    </div>
                    <div className="bg-orange-500/10 text-orange-600 dark:text-orange-400 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                        {events.length} Eventos
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                {events.map((event, index) => {
                    const date = parseSafeDate(event.date)!;

                    let bgClass = 'bg-slate-50 dark:bg-slate-800/40';
                    let icon = <Calendar className="h-4 w-4" />;
                    let accentColor = 'text-slate-500';

                    if (event.type === 'holiday') {
                        bgClass = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30';
                        icon = <Palmtree className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
                        accentColor = 'text-emerald-600 dark:text-emerald-400';
                    } else if (event.type === 'vacation_start') {
                        bgClass = 'bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30';
                        icon = <PlaneTakeoff className="h-4 w-4 text-orange-600 dark:text-orange-400" />;
                        accentColor = 'text-orange-600 dark:text-orange-400';
                    } else if (event.type === 'vacation_end') {
                        bgClass = 'bg-sky-50 dark:bg-sky-950/20 border-sky-100 dark:border-sky-900/30';
                        icon = <PlaneLanding className="h-4 w-4 text-sky-600 dark:text-sky-400" />;
                        accentColor = 'text-sky-600 dark:text-sky-400';
                    } else if (event.type === 'suspension_return') {
                        bgClass = 'bg-pink-50 dark:bg-pink-950/20 border-pink-100 dark:border-pink-900/30';
                        icon = <HistoryIcon className="h-4 w-4 text-pink-600 dark:text-pink-400" />;
                        accentColor = 'text-pink-600 dark:text-pink-400';
                    } else if (event.type === 'aso_expiration') {
                        bgClass = 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30';
                        icon = <Activity className="h-4 w-4 text-red-600 dark:text-red-400" />;
                        accentColor = 'text-red-600 dark:text-red-400';
                    } else if (event.type === 'registration_update') {
                        bgClass = 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30';
                        icon = <FileEdit className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
                        accentColor = 'text-indigo-600 dark:text-indigo-400';
                    } else if (event.type === 'medical_return') {
                        bgClass = 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30';
                        icon = <Stethoscope className="h-4 w-4 text-red-600 dark:text-red-400" />;
                        accentColor = 'text-red-600 dark:text-red-400';
                    }

                    const getEventLink = () => {
                        if (event.type === 'holiday' || !event.employeeId) return null;

                        if (event.type === 'vacation_start' || event.type === 'vacation_end') {
                            return `/dashboard/vacations?employeeId=${event.employeeId}`;
                        }

                        if (event.type === 'medical_return') {
                            return `/dashboard/personnel?id=${event.employeeId}&tab=medical`;
                        }

                        if (event.type === 'aso_expiration') {
                            return `/dashboard/personnel?id=${event.employeeId}&tab=health&mode=edit`;
                        }

                        if (event.type === 'registration_update') {
                            return `/dashboard/personnel?id=${event.employeeId}&tab=personal&mode=edit`;
                        }

                        if (event.type === 'suspension_return') {
                            return `/dashboard/personnel?id=${event.employeeId}&tab=history`;
                        }

                        return `/dashboard/personnel?id=${event.employeeId}`;
                    };

                    const eventLink = getEventLink();

                    const content = (
                        <div
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:translate-x-1 ${bgClass} h-full w-full`}
                        >
                            <div className="flex flex-col items-center justify-center min-w-[40px] border-r dark:border-slate-700/50 pr-3">
                                <span className={`text-[10px] font-black uppercase tracking-tighter ${accentColor}`}>
                                    {format(date, 'MMM', { locale: ptBR })}
                                </span>
                                <span className="text-xl font-black text-slate-800 dark:text-white leading-none">
                                    {format(date, 'dd')}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    {icon}
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${accentColor}`}>
                                        {event.title}
                                    </span>
                                </div>

                                {event.employee ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0 border border-white dark:border-slate-600 shadow-sm">
                                            {event.photoUrl ? (
                                                <img src={event.photoUrl} alt={event.employee} className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-[10px] font-bold h-full w-full flex items-center justify-center uppercase">
                                                    {event.employee.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                                            {event.employee}
                                        </p>
                                    </div>
                                ) : (
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                        Feriado Nacional
                                    </p>
                                )}
                            </div>

                            {event.type === 'vacation_start' && (
                                <div className="self-start">
                                    <span className="bg-orange-600 h-1.5 w-1.5 rounded-full flex animate-pulse"></span>
                                </div>
                            )}
                        </div>
                    );

                    return (
                        <motion.div
                            key={`${event.type}-${event.date}-${index}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
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
            </CardContent>
        </Card>
    );
}
