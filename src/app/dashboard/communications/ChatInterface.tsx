'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, User, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { getTicketMessages, sendSupportMessage } from '@/modules/communications/actions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function ChatInterface({ ticket, initialMessages }: { ticket: any, initialMessages: any[] }) {
    const [messages, setMessages] = useState<any[]>(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Polling for new messages
    useEffect(() => {
        const interval = setInterval(async () => {
            const res = await getTicketMessages(ticket.id);
            if (res.success) setMessages(res.data || []);
        }, 5000);
        return () => clearInterval(interval);
    }, [ticket.id]);

    const handleSend = async () => {
        if (!newMessage.trim() || loading) return;

        const content = newMessage;
        setNewMessage('');
        setLoading(true);

        const res = await sendSupportMessage(ticket.id, content);
        if (res.success) {
            const megRes = await getTicketMessages(ticket.id);
            if (megRes.success) setMessages(megRes.data || []);
        } else {
            toast.error('Erro ao enviar mensagem');
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold overflow-hidden">
                        {ticket.employee?.photoUrl ? <img src={ticket.employee.photoUrl} className="h-full w-full object-cover" /> : <User className="h-5 w-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{ticket.employee?.name}</h3>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none">{ticket.subject}</p>
                    </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 space-x-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Em Atendimento</span>
                </Badge>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20 dark:bg-slate-900/10">
                {messages.map((msg) => {
                    const isRH = msg.sender?.role !== 'EMPLOYEE';
                    return (
                        <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isRH ? "ml-auto items-end" : "mr-auto items-start")}>
                            <div className={cn(
                                "p-3 px-4 rounded-2xl text-sm",
                                isRH
                                    ? "bg-slate-800 text-white rounded-tr-none border border-slate-700 shadow-xl"
                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none shadow-sm"
                            )}>
                                {msg.content}
                            </div>
                            <span className="text-[10px] text-slate-400 font-bold mt-1.5 px-2 flex items-center gap-1.5">
                                <Clock className="h-2.5 w-2.5" />
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {isRH && <span className="text-orange-500">Equipe RH</span>}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Input Footer */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                    <Input
                        placeholder="Digite sua resposta..."
                        className="bg-slate-100 dark:bg-slate-800 border-none h-12 rounded-xl focus:ring-orange-500"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        size="lg"
                        className="bg-orange-500 hover:bg-orange-600 text-white w-12 h-12 p-0 rounded-xl"
                        onClick={handleSend}
                        disabled={loading}
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Badge({ children, variant = 'default', className = '' }: any) {
    return (
        <span className={cn(
            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-[0.1em] border",
            className
        )}>
            {children}
        </span>
    );
}
