'use server';

import { getSupportTickets, getTicketMessages, sendSupportMessage } from '@/modules/communications/actions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { MessageSquare, User, Clock, Send, CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Client component part for the chat interaction
import { ChatInterface } from './ChatInterface';

export default async function CommunicationsPage({ searchParams }: { searchParams: { ticketId?: string } }) {
    const params = await searchParams;
    const ticketId = params.ticketId;

    const { success, data: tickets = [] } = await getSupportTickets();

    let activeTicket = null;
    let messages: any[] = [];

    if (ticketId) {
        activeTicket = tickets.find((t: any) => t.id === ticketId);
        const megRes = await getTicketMessages(ticketId);
        if (megRes.success) messages = megRes.data || [];
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Central de <span className="text-orange-500">Atendimento</span></h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Gerencie as comunicações e dúvidas dos colaboradores.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {/* Tickets List */}
                <Card className="lg:col-span-1 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Solicitações</CardTitle>
                            <Badge variant="outline" className="font-bold">{tickets.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {tickets.map((ticket: any) => (
                                <a
                                    key={ticket.id}
                                    href={`?ticketId=${ticket.id}`}
                                    className={`block p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${ticketId === ticket.id ? 'bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{ticket.subject}</span>
                                        <span className="text-[10px] text-slate-400 uppercase font-black">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-5 w-5 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {ticket.employee?.photoUrl ? <img src={ticket.employee.photoUrl} className="h-full w-full object-cover" /> : <User className="h-3 w-3 text-slate-400" />}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{ticket.employee?.name || 'Sistema'}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-1 italic">
                                        "{ticket.messages?.[0]?.content}"
                                    </p>
                                </a>
                            ))}
                            {tickets.length === 0 && (
                                <div className="p-8 text-center space-y-2 opacity-50">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Sem solicitações</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Chat Area */}
                <Card className="lg:col-span-2 flex flex-col overflow-hidden border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    {activeTicket ? (
                        <ChatInterface ticket={activeTicket} initialMessages={messages} />
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                            <div className="h-20 w-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                                <MessageSquare className="h-10 w-10 text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">Selecione uma conversa</h3>
                                <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Escolha um atendimento à esquerda para visualizar o histórico e responder o colaborador.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
