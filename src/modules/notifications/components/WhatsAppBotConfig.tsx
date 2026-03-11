'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, CheckCircle2, QrCode, Loader2, AlertCircle, RefreshCw, X, Save, Plus, Calendar, Heart, ShieldAlert, Zap, Puzzle, Trash2, History, BarChart3, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

import { QRCodeCanvas } from 'qrcode.react';
import { getWhatsAppConfig, updateWhatsAppConfig } from '../actions/config';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogTrigger,
    DialogDescription
} from '@/shared/components/ui/dialog';

interface WhatsAppStatus {
    isReady: boolean;
    hasQR: boolean;
    qr: string | null;
}

const AVAILABLE_TRIGGERS = [
    { 
        id: 'onboarding', 
        name: 'Lembrete de Onboarding', 
        icon: AlertCircle, 
        color: 'text-orange-400', 
        bg: 'bg-orange-500/20',
        vars: ['{name}', '{link}'],
        default: 'Olá, *{name}*! Notamos que seu cadastro ainda não foi concluído. 📝\n\nComplete seus dados aqui: {link}\n\nObrigado!'
    },
    { 
        id: 'scale', 
        name: 'Notificação de Escala', 
        icon: QrCode, 
        color: 'text-indigo-400', 
        bg: 'bg-indigo-500/20',
        vars: ['{name}', '{link}', '{date}'],
        default: 'Olá, *{name}*! Sua escala para amanhã ({date}) já está disponível. 🗓️\n\nConfira no portal: {link}'
    },
    { 
        id: 'birthday', 
        name: 'Feliz Aniversário', 
        icon: Heart, 
        color: 'text-rose-400', 
        bg: 'bg-rose-500/20',
        vars: ['{name}'],
        default: 'Parabéns, *{name}*! 🎉🎈 A Família RH deseja um dia incrível e cheio de realizações para você!'
    },
    { 
        id: 'vacation', 
        name: 'Aviso de Férias', 
        icon: Calendar, 
        color: 'text-emerald-400', 
        bg: 'bg-emerald-500/20',
        vars: ['{name}', '{date}'],
        default: 'Olá, *{name}*! Suas férias começam em breve ({date}). 🏖️ Aproveite seu descanso!'
    },
    { 
        id: 'aso', 
        name: 'Vencimento de ASO', 
        icon: ShieldAlert, 
        color: 'text-amber-400', 
        bg: 'bg-amber-500/20',
        vars: ['{name}', '{days}'],
        default: 'Atenção, *{name}*! Seu exame ASO vence em {days} dias. 👩‍⚕️ Por favor, agende seu exame periódico.'
    },
    { 
        id: 'policy', 
        name: 'Atualização de Política', 
        icon: MessageSquare, 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20',
        vars: ['{name}', '{title}', '{link}'],
        default: 'Olá, *{name}*! 📢 Uma nova política da empresa foi publicada: *{title}*.\n\nLeia os detalhes aqui: {link}'
    },
    { 
        id: 'manual', 
        name: 'Gatilho Personalizável', 
        icon: Puzzle, 
        color: 'text-fuchsia-400', 
        bg: 'bg-fuchsia-500/20',
        vars: ['{name}', '{field1}', '{field2}'],
        default: 'Olá, *{name}*! Temos uma atualização importante: {field1}'
    }
];

interface AutoReply {
    id: string;
    keyword: string;
    response: string;
    enabled: boolean;
}

export function WhatsAppBotConfig() {
    const [status, setStatus] = useState<WhatsAppStatus | null>(null);
    const [config, setConfig] = useState<Record<string, string>>({});
    const [autoReplies, setAutoReplies] = useState<AutoReply[]>([]);
    const [activeTriggers, setActiveTriggers] = useState<string[]>(['onboarding', 'scale']);
    const [loading, setLoading] = useState(true);
    const [activeSubTab, setActiveSubTab] = useState<'status' | 'automation' | 'autoreply' | 'history'>('status');
    const [saving, setSaving] = useState(false);
    const [polling, setPolling] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/notifications/whatsapp/status');
            const data = await res.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch WhatsApp status:', error);
        }
    };

    const loadConfig = async () => {
        const res = await getWhatsAppConfig();
        if (res.success && res.data) {
            setConfig(prev => ({ ...prev, ...res.data }));
            
            if (res.data['whatsapp_auto_replies']) {
                try {
                    setAutoReplies(JSON.parse(res.data['whatsapp_auto_replies']));
                } catch (e) {
                    console.error('Failed to parse auto-replies', e);
                }
            }

            // Deduce active triggers from keys
            const activeSet = new Set<string>();
            Object.keys(res.data).forEach(key => {
                if (key.startsWith('whatsapp_') && key.endsWith('_enabled') && res.data?.[key] === 'true') {
                    activeSet.add(key.replace('whatsapp_', '').replace('_enabled', ''));
                }
            });
            if (activeSet.size > 0) setActiveTriggers(Array.from(activeSet));
        }
    };

    const addAutomation = (triggerId: string, customName?: string) => {
        const trigger = AVAILABLE_TRIGGERS.find(t => t.id === triggerId);
        if (!trigger) return;

        const id = customName ? `custom_${Math.random().toString(36).substr(2, 5)}` : triggerId;
        const name = customName || trigger.name;

        if (activeTriggers.includes(id)) {
            toast.error('Esta automação já está ativa');
            return;
        }

        setConfig(prev => ({
            ...prev,
            [`whatsapp_${id}_enabled`]: 'true',
            [`whatsapp_${id}_template`]: trigger.default,
            [`whatsapp_${id}_name`]: name
        }));
        setActiveTriggers(prev => [...prev, id]);
        setIsDialogOpen(false);
        toast.success(`${name} adicionado à lista`);
    };

    const removeAutomation = (triggerId: string) => {
        setConfig(prev => ({
            ...prev,
            [`whatsapp_${triggerId}_enabled`]: 'false'
        }));
        setActiveTriggers(prev => prev.filter(id => id !== triggerId));
        toast.info('Automação desativada');
    };

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchStatus(), loadConfig()]);
            setLoading(false);
        };
        init();

        const interval = setInterval(fetchStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSaveConfig = async () => {
        setSaving(true);
        const finalConfig = {
            ...config,
            'whatsapp_auto_replies': JSON.stringify(autoReplies)
        };
        const res = await updateWhatsAppConfig(finalConfig);
        if (res.success) {
            toast.success('Configurações do bot atualizadas!');
        } else {
            toast.error(res.error || 'Erro ao salvar');
        }
        setSaving(false);
    };

    const handleReconnect = async () => {
        setPolling(true);
        await fetchStatus();
        setTimeout(() => setPolling(false), 1000);
        toast.info('Sincronizando WhatsApp...');
    };

    const addAutoReply = () => {
        const newReply: AutoReply = {
            id: Math.random().toString(36).substr(2, 9),
            keyword: '',
            response: '',
            enabled: true
        };
        setAutoReplies([...autoReplies, newReply]);
    };

    const removeAutoReply = (id: string) => {
        setAutoReplies(autoReplies.filter(r => r.id !== id));
    };

    const updateAutoReply = (id: string, updates: Partial<AutoReply>) => {
        setAutoReplies(autoReplies.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    if (loading && !status) {
        return (
            <div className="space-y-6">
                <div className="h-64 bg-white/5 animate-pulse rounded-[3rem] border border-white/10" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-40 bg-white/5 animate-pulse rounded-[2.5rem] border border-white/10" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-[#161B29]/95 border border-white/10 rounded-[40px] overflow-hidden backdrop-blur-3xl shadow-2xl">
            <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-[1000] text-white tracking-tight flex items-center gap-3">
                            <MessageSquare className="h-6 w-6 text-emerald-400 font-bold" />
                            WhatsApp Bot
                        </CardTitle>
                        <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                            Assistente Digital Família
                        </CardDescription>
                    </div>
                </div>

                <div className="flex gap-2 mt-8 p-1 bg-white/5 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveSubTab('status')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSubTab === 'status' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Status
                    </button>
                    <button
                        onClick={() => setActiveSubTab('automation')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSubTab === 'automation' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Automações
                    </button>
                    <button
                        onClick={() => setActiveSubTab('autoreply')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSubTab === 'autoreply' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Auto Respostas
                    </button>
                    <button
                        onClick={() => setActiveSubTab('history')}
                        className={cn(
                            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeSubTab === 'history' ? "bg-white text-slate-900 shadow-xl" : "text-slate-400 hover:text-white"
                        )}
                    >
                        Histórico
                    </button>
                </div>
            </CardHeader>

            <CardContent className="p-8 pt-4 min-h-[400px]">
                <AnimatePresence mode="wait">
                    {activeSubTab === 'status' && (
                        <motion.div
                            key="status"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                        >
                            <div className={cn(
                                "p-6 rounded-3xl border flex items-center gap-6",
                                status?.isReady
                                    ? "bg-emerald-500/5 border-emerald-500/10"
                                    : "bg-amber-500/5 border-amber-500/10"
                            )}>
                                <div className={cn(
                                    "h-16 w-16 rounded-2xl flex items-center justify-center shrink-0",
                                    status?.isReady ? "bg-emerald-500/20" : "bg-amber-500/20"
                                )}>
                                    {status?.isReady ? (
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                    ) : (
                                        <QrCode className="h-8 w-8 text-amber-400" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-[1000] text-sm uppercase tracking-wider">
                                        {status?.isReady ? 'Conectado com Sucesso' : 'Aguardando Autenticação'}
                                    </h4>
                                    <p className="text-slate-400 text-xs font-bold leading-relaxed">
                                        {status?.isReady
                                            ? 'O assistente de RH está ativo e enviando notificações automáticas.'
                                            : 'Escaneie o QR Code abaixo com o WhatsApp do seu celular.'}
                                    </p>
                                </div>
                            </div>

                            {status?.isReady ? (
                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <RefreshCw className="h-4 w-4 text-emerald-400 animate-spin-slow" />
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Sincronização Ativa</span>
                                    </div>
                                    <Button
                                        onClick={handleReconnect}
                                        disabled={polling}
                                        className="h-10 px-6 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest"
                                    >
                                        Reconectar
                                    </Button>
                                </div>
                            ) : status?.hasQR ? (
                                <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 flex flex-col items-center gap-6 text-center">
                                    <div className="bg-white p-4 rounded-3xl shadow-2xl">
                                        {status.qr ? (
                                            <QRCodeCanvas
                                                value={status.qr}
                                                size={200}
                                                level="H"
                                                includeMargin={true}
                                            />
                                        ) : (
                                            <div className="h-48 w-48 bg-slate-100 rounded-xl flex items-center justify-center">
                                                <Loader2 className="h-10 w-10 text-slate-400 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight max-w-[240px]">
                                        Abra o WhatsApp no seu celular e escaneie o código para começar.
                                    </p>
                                </div>
                            ) : (
                                <div className="p-12 text-center space-y-4">
                                    <Loader2 className="h-10 w-10 text-brand-orange animate-spin mx-auto" />
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Gerando Sessão Segura...</p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeSubTab === 'automation' && (
                        <motion.div
                            key="automation"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Regras de <span className="text-brand-orange">Envio</span></h3>
                                
                                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-widest gap-2">
                                            <Plus className="h-3 w-3" />
                                            Nova Automação
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-[#161B29] border border-white/10 rounded-[2.5rem] max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-white font-black italic uppercase tracking-tighter">Biblioteca de <span className="text-brand-orange">Gatilhos</span></DialogTitle>
                                            <DialogDescription className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Escolha uma ação para disparar o bot automaticamente.</DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-3 py-6">
                                            {AVAILABLE_TRIGGERS.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => {
                                                        if (t.id === 'manual') {
                                                            const name = prompt('Nome para este gatilho personalizado:');
                                                            if (name) addAutomation(t.id, name);
                                                        } else {
                                                            addAutomation(t.id);
                                                        }
                                                    }}
                                                    className={cn(
                                                        "flex items-center gap-4 p-4 rounded-2xl border border-white/5 transition-all text-left group w-full",
                                                        (t.id !== 'manual' && activeTriggers.includes(t.id)) ? "opacity-40 cursor-not-allowed" : "hover:bg-white/5 hover:border-white/10 active:scale-[0.98]"
                                                    )}
                                                >
                                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", t.bg)}>
                                                        <t.icon className={cn("h-5 w-5", t.color)} />
                                                    </div>
                                                    <div>
                                                        <p className="text-white text-[11px] font-black uppercase tracking-widest">{t.name}</p>
                                                        {(t.id !== 'manual' && activeTriggers.includes(t.id)) && <p className="text-emerald-400 text-[8px] font-black uppercase">Já Ativo</p>}
                                                        {t.id === 'manual' && <p className="text-slate-500 text-[8px] font-black uppercase">Crie uma nova regra de disparo</p>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="grid gap-6">
                                {activeTriggers.length === 0 ? (
                                    <div className="py-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nenhuma automação configurada.</p>
                                    </div>
                                ) : (
                                    activeTriggers.map(triggerId => {
                                        const trigger = AVAILABLE_TRIGGERS.find(t => t.id === triggerId) || AVAILABLE_TRIGGERS.find(t => t.id === 'manual');
                                        if (!trigger) return null;

                                        const displayName = config[`whatsapp_${triggerId}_name`] || trigger.name;

                                        return (
                                            <motion.div 
                                                layout
                                                key={triggerId} 
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="space-y-4 group/aut"
                                            >
                                                <div className="flex items-center justify-between px-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center", trigger.bg)}>
                                                            <trigger.icon className={cn("h-4 w-4", trigger.color)} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-black text-white uppercase tracking-widest">{displayName}</span>
                                                            {triggerId.startsWith('custom_') && (
                                                                <span className="text-[7px] font-black text-slate-500 uppercase tracking-tighter italic">ID Integração: {triggerId}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <button 
                                                            onClick={() => removeAutomation(triggerId)}
                                                            className="opacity-0 group-hover/aut:opacity-100 text-slate-500 hover:text-rose-500 transition-all text-[8px] font-black uppercase tracking-tighter"
                                                        >
                                                            Remover
                                                        </button>
                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                checked={config[`whatsapp_${triggerId}_enabled`] === 'true'}
                                                                onChange={e => setConfig({ ...config, [`whatsapp_${triggerId}_enabled`]: String(e.target.checked) })}
                                                                className="sr-only peer"
                                                            />
                                                            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <textarea
                                                        value={config[`whatsapp_${triggerId}_template`] || ''}
                                                        onChange={e => setConfig({ ...config, [`whatsapp_${triggerId}_template`]: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-6 text-xs text-slate-300 min-h-[120px] focus:border-brand-orange outline-none transition-all font-medium leading-relaxed group-hover/aut:bg-white/10"
                                                        placeholder="Escreva sua mensagem personalizada..."
                                                    />
                                                    <div className="absolute bottom-4 right-4 flex gap-2">
                                                        <span className="px-3 py-1.5 rounded-xl bg-[#161B29] border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                                                            Tags: {trigger.vars.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })
                                )}
                            </div>

                            <Button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="w-full h-14 rounded-2xl bg-brand-orange text-white font-[1000] text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 shadow-xl shadow-brand-orange/20 transition-all flex items-center justify-center gap-3 mt-4"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Configurações de Bot 🤖
                            </Button>
                        </motion.div>
                    )}

                    {activeSubTab === 'autoreply' && (
                        <motion.div
                            key="autoreply"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Dicionário de <span className="text-emerald-400">Auto Respostas</span></h3>
                                <Button 
                                    onClick={addAutoReply}
                                    className="h-10 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[9px] font-black uppercase tracking-widest gap-2"
                                >
                                    <Plus className="h-3 w-3" />
                                    Nova Resposta
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {autoReplies.length === 0 ? (
                                    <div className="py-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center">
                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Nenhuma auto-resposta cadastrada.</p>
                                    </div>
                                ) : (
                                    autoReplies.map((reply) => (
                                        <div key={reply.id} className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4 group">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 flex-1 max-w-[40%]">
                                                    <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                        <Zap className="h-4 w-4" />
                                                    </div>
                                                    <input 
                                                        value={reply.keyword}
                                                        onChange={e => updateAutoReply(reply.id, { keyword: e.target.value })}
                                                        placeholder="Palavra-chave (ex: Vale)"
                                                        className="bg-transparent border-none text-[10px] font-black text-white uppercase tracking-widest focus:ring-0 w-full"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => removeAutoReply(reply.id)}
                                                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={reply.enabled}
                                                            onChange={e => updateAutoReply(reply.id, { enabled: e.target.checked })}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
                                                    </label>
                                                </div>
                                            </div>
                                            <textarea 
                                                value={reply.response}
                                                onChange={e => updateAutoReply(reply.id, { response: e.target.value })}
                                                placeholder="Sua resposta automática aqui..."
                                                className="w-full bg-black/20 border border-white/5 rounded-2xl p-4 text-xs text-slate-300 min-h-[80px] focus:border-emerald-500/50 outline-none transition-all font-medium"
                                            />
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="w-full h-14 rounded-2xl bg-brand-orange text-white font-[1000] text-[11px] uppercase tracking-[0.2em] hover:bg-orange-600 shadow-xl shadow-brand-orange/20 transition-all flex items-center justify-center gap-3"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                Salvar Base de Conhecimento 🧠
                            </Button>
                        </motion.div>
                    )}

                    {activeSubTab === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-white uppercase tracking-[0.2em] italic">Registro de <span className="text-indigo-400">Atividades</span></h3>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                                    <Search className="h-3 w-3 text-slate-500" />
                                    <input placeholder="Buscar por nome ou número..." className="bg-transparent border-none text-[10px] text-white focus:ring-0 w-40" />
                                </div>
                            </div>

                            <div className="bg-black/20 rounded-[2rem] border border-white/5 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Colaborador</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Gatilho</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Horário</th>
                                            <th className="px-6 py-4 text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { name: 'João Silva', trigger: 'Escala', time: '18:02', status: 'Enviado' },
                                            { name: 'Maria Santos', trigger: 'Onboarding', time: '14:30', status: 'Enviado' },
                                            { name: 'Ricardo Dias', trigger: 'Aviso Férias', time: '09:15', status: 'Falhou' },
                                            { name: 'Auto-Resposta', trigger: 'Keyword: Vale', time: '08:45', status: 'Enviado' },
                                        ].map((log, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4 text-[11px] font-bold text-white">{log.name}</td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 rounded-lg bg-white/5 text-[9px] font-bold text-slate-400 uppercase">{log.trigger}</span>
                                                </td>
                                                <td className="px-6 py-4 text-[10px] text-slate-500 font-medium">{log.time}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest",
                                                        log.status === 'Enviado' ? "text-emerald-400" : "text-rose-500"
                                                    )}>{log.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="p-8 text-center border-t border-white/5">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic opacity-50">Isso é uma prévia do histórico. Em breve você verá logs em tempo real.</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
        </Card>
    );
}

