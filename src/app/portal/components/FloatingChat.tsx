'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, Minimize2, Plus, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { getSupportTickets, createSupportTicket, sendSupportMessage, getTicketMessages } from '@/modules/communications/actions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function FloatingChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTicket, setActiveTicket] = useState<any>(null);
    const [tickets, setTickets] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [newSubject, setNewSubject] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Refresh tickets on open
    useEffect(() => {
        if (isOpen) {
            loadTickets();
        }
    }, [isOpen]);

    // Load messages when ticket changes
    useEffect(() => {
        if (activeTicket) {
            loadMessages(activeTicket.id);
            // Polling for new messages
            const interval = setInterval(() => loadMessages(activeTicket.id), 5000);
            return () => clearInterval(interval);
        }
    }, [activeTicket]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadTickets = async () => {
        const res = await getSupportTickets();
        if (res.success) setTickets(res.data);
    };

    const loadMessages = async (id: string) => {
        const res = await getTicketMessages(id);
        if (res.success) setMessages(res.data);
    };

    const handleCreateTicket = async () => {
        if (!newSubject || !newMessage) {
            toast.error('Preencha o assunto e a mensagem');
            return;
        }
        setLoading(true);
        const res = await createSupportTicket(newSubject, newMessage);
        if (res.success) {
            setNewSubject('');
            setNewMessage('');
            setIsCreating(false);
            setActiveTicket(res.data);
            loadTickets();
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !activeTicket) return;

        const content = newMessage;
        setNewMessage('');

        // Optimistic update
        const tempMsg = { id: 'temp', content, createdAt: new Date(), sender: { role: 'EMPLOYEE' } };
        setMessages(prev => [...prev, tempMsg]);

        const res = await sendSupportMessage(activeTicket.id, content);
        if (!res.success) {
            toast.error('Erro ao enviar');
            loadMessages(activeTicket.id);
        } else {
            loadMessages(activeTicket.id);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[90vw] md:w-[400px] h-[600px] bg-[#0D121F]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 bg-gradient-to-r from-brand-orange/20 to-transparent border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-brand-orange/20 flex items-center justify-center border border-brand-orange/30 shadow-lg shadow-brand-orange/10">
                                    {activeTicket ? <MessageSquare className="h-5 w-5 text-brand-orange" /> : <Sparkles className="h-5 w-5 text-brand-orange" />}
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-widest text-xs">Atendimento RH</h3>
                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Suporte Online
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {activeTicket && (
                                    <button onClick={() => setActiveTicket(null)} className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
                                        <Minimize2 className="h-4 w-4" />
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition-all">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {!activeTicket && !isCreating && (
                                <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                                    <div className="space-y-1 mb-6">
                                        <h4 className="text-white font-bold text-lg">Olá! 👋</h4>
                                        <p className="text-slate-400 text-sm">Como podemos te ajudar hoje?</p>
                                    </div>

                                    <Button
                                        onClick={() => setIsCreating(true)}
                                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl h-14 justify-start px-6 gap-4 group"
                                    >
                                        <div className="h-8 w-8 rounded-xl bg-brand-orange flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                            <Plus className="h-5 w-5" />
                                        </div>
                                        <span className="font-bold text-sm">Nova Solicitação</span>
                                    </Button>

                                    <div className="pt-6">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Conversas Recentes</p>
                                        <div className="space-y-3">
                                            {tickets.map(ticket => (
                                                <button
                                                    key={ticket.id}
                                                    onClick={() => setActiveTicket(ticket)}
                                                    className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-brand-orange/30 transition-all text-left group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-white font-bold text-sm truncate">{ticket.subject}</span>
                                                        <span className="text-[9px] text-slate-500 uppercase font-black">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-400 line-clamp-1 opacity-70">{ticket.messages?.[0]?.content}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {isCreating && (
                                <div className="flex-1 p-6 space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Qual o assunto?</label>
                                        <Input
                                            placeholder="Ex: Dúvida sobre Férias"
                                            className="bg-black/40 border-white/5 rounded-2xl h-12 text-white"
                                            value={newSubject}
                                            onChange={e => setNewSubject(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Sua mensagem</label>
                                        <textarea
                                            placeholder="Descreva detalhadamente..."
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-white min-h-[150px] resize-none focus:outline-none focus:ring-1 focus:ring-brand-orange/50"
                                            value={newMessage}
                                            onChange={e => setNewMessage(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="ghost"
                                            className="flex-1 rounded-2xl h-12 text-slate-400 font-bold"
                                            onClick={() => setIsCreating(false)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            className="flex-[2] bg-brand-orange hover:bg-orange-600 text-white rounded-2xl h-12 font-black uppercase tracking-tighter"
                                            onClick={handleCreateTicket}
                                            disabled={loading}
                                        >
                                            Enviar Agora
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeTicket && (
                                <>
                                    <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6 scroll-smooth">
                                        <div className="text-center mb-8">
                                            <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] text-slate-500 font-black uppercase tracking-widest">
                                                Ticket: {activeTicket.subject}
                                            </div>
                                        </div>

                                        {messages.map((msg) => {
                                            const isMe = msg.sender?.role === 'EMPLOYEE';
                                            return (
                                                <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                                                    <div className={cn(
                                                        "p-4 rounded-3xl text-sm leading-relaxed",
                                                        isMe
                                                            ? "bg-brand-orange text-white rounded-tr-none shadow-lg shadow-brand-orange/10"
                                                            : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"
                                                    )}>
                                                        {msg.content}
                                                    </div>
                                                    <span className="text-[9px] text-slate-500 font-bold mt-1.5 px-2">
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {!isMe && " • RH"}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Input Footer */}
                                    <div className="p-4 bg-white/[0.02] border-t border-white/5 backdrop-blur-sm">
                                        <div className="flex gap-3 items-center bg-black/40 border border-white/10 rounded-full px-2 py-2 pl-6 focus-within:border-brand-orange/50 transition-all">
                                            <input
                                                placeholder="Sua mensagem..."
                                                className="flex-1 bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-slate-600"
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                                            />
                                            <button
                                                onClick={handleSendMessage}
                                                className="h-10 w-10 rounded-full bg-brand-orange flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand-orange/20"
                                            >
                                                <Send className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Safety Badge */}
                        <div className="py-3 bg-black/40 text-center border-t border-white/5">
                            <p className="text-[8px] text-slate-600 font-black uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                                <ShieldCheck className="h-3 w-3 text-emerald-500" /> Comunicação Segura & Encriptada
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-16 w-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl transition-all duration-500 relative group overflow-hidden",
                    isOpen
                        ? "bg-rose-500 rotate-90 shadow-rose-500/40"
                        : "bg-brand-orange shadow-brand-orange/40 hover:shadow-brand-orange/60"
                )}
            >
                {isOpen ? (
                    <X className="h-7 w-7" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <MessageSquare className="h-7 w-7" />
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 border-4 border-[#0A0F1C] rounded-full" />
                    </>
                )}
            </motion.button>
        </div>
    );
}
