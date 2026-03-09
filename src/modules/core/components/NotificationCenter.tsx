'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, Info, AlertTriangle, CheckCircle2, Zap, ArrowRight } from 'lucide-react';
import { getNotificationsAction, markNotificationAsReadAction, clearAllNotificationsAction } from '@/modules/core/actions/notifications';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function NotificationCenter() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const loadNotifications = async () => {
        const res = await getNotificationsAction();
        if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
        }
    };

    useEffect(() => {
        loadNotifications();
        // Poll every 60 seconds for simple "real-time"
        const interval = setInterval(loadNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = async (id: string) => {
        await markNotificationAsReadAction(id);
        loadNotifications();
    };

    const handleClearAll = async () => {
        await clearAllNotificationsAction();
        loadNotifications();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
            case 'WARNING': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
            case 'URGENT': return <Zap className="h-4 w-4 text-rose-500 animate-pulse" />;
            default: return <Info className="h-4 w-4 text-blue-400" />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all relative group"
            >
                <Bell className={cn("h-6 w-6 transition-all duration-500 group-hover:rotate-12", unreadCount > 0 && "text-brand-orange drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]")} />
                {unreadCount > 0 && (
                    <span className="absolute top-2.5 right-2.5 h-4 min-w-[16px] px-1 bg-brand-orange text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[#0A0F1C] shadow-[0_0_15px_rgba(249,115,22,0.8)] animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-4 w-96 bg-[#0E1525] border border-white/10 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden z-50 origin-top-right backdrop-blur-3xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Notificações</h4>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{unreadCount} pendentes</p>
                                </div>
                                <button
                                    onClick={handleClearAll}
                                    className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    Limpar Tudo
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                                {notifications.length > 0 ? (
                                    notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={cn(
                                                "p-5 flex gap-4 hover:bg-white/[0.03] transition-colors relative group/notif",
                                                !notif.isRead && "bg-brand-orange/[0.02]"
                                            )}
                                        >
                                            <div className={cn(
                                                "h-10 w-10 rounded-xl flex items-center justify-center border border-white/10 shrink-0",
                                                !notif.isRead ? "bg-white/10" : "bg-white/5"
                                            )}>
                                                {getIcon(notif.type)}
                                            </div>

                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <h5 className="text-[11px] font-black text-white uppercase tracking-tight leading-none">{notif.title}</h5>
                                                    <span className="text-[9px] font-bold text-slate-600">agora</span>
                                                </div>
                                                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{notif.message}</p>

                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        className="inline-flex items-center gap-2 text-[9px] font-black text-brand-orange uppercase tracking-[0.2em] mt-2 group/link"
                                                        onClick={() => {
                                                            handleRead(notif.id);
                                                            setIsOpen(false);
                                                        }}
                                                    >
                                                        Visualizar Detalhes
                                                        <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>
                                                )}
                                            </div>

                                            {!notif.isRead && (
                                                <button
                                                    onClick={() => handleRead(notif.id)}
                                                    className="absolute top-5 right-5 h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center opacity-0 group-hover/notif:opacity-100 transition-opacity"
                                                >
                                                    <Check className="h-3 w-3 text-emerald-400" />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-12 flex flex-col items-center justify-center gap-4">
                                        <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 opacity-20">
                                            <Bell className="h-8 w-8 text-white" />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Céu limpo por aqui</p>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-4 bg-white/[0.01] border-t border-white/5 text-center">
                                    <button className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">Ver Histórico Completo</button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
