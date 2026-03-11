'use client';

import { WhatsAppBotConfig } from '@/modules/notifications/components/WhatsAppBotConfig';
import { Bot, Zap, MessageSquare, History, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppBotPage() {
    return (
        <div className="space-y-8 pb-12">
            {/* Header com Design Premium */}
            <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 p-8 lg:p-12 shadow-2xl border border-white/5">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-brand-orange/10 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest italic">
                            <Zap className="h-3 w-3 fill-emerald-400" />
                            Módulo de Automação Inteligente
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-[1000] text-white tracking-tighter leading-none italic uppercase">
                            WhatsApp <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600">Assistant</span>
                        </h1>
                        <p className="text-slate-400 text-sm lg:text-base font-medium leading-relaxed max-w-lg">
                            Potencialize a comunicação da sua empresa com automações inteligentes, 
                            respostas instantâneas e notificações personalizadas para cada colaborador.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 lg:w-96">
                        <StatCard icon={MessageSquare} label="Mensagens" value="--" sub="Enviadas hoje" />
                        <StatCard icon={Users} label="Alcance" value="--" sub="Colaboradores" />
                    </div>
                </div>
            </div>

            {/* Configuração Principal */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <WhatsAppBotConfig />
            </motion.div>

            {/* Seção Adicional: Dicas e Atalhos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ShortcutCard 
                    icon={Bot} 
                    title="Treine seu Assistente" 
                    description="Adicione palavras-chave na aba de Auto Respostas para ensinar o bot a tirar dúvidas."
                    color="text-emerald-400"
                />
                <ShortcutCard 
                    icon={History} 
                    title="Histórico de Envio" 
                    description="Em breve você poderá visualizar todos os logs de mensagens enviadas."
                    color="text-brand-orange"
                />
                <ShortcutCard 
                    icon={BarChart3} 
                    title="Métricas Avançadas" 
                    description="Acompanhe a taxa de leitura e interação das suas mensagens automáticas."
                    color="text-indigo-400"
                />
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, sub }: any) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-5 space-y-2 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Icon className="h-4 w-4" />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <div className="space-y-1">
                <div className="text-2xl font-black text-white italic">{value}</div>
                <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tight">{sub}</div>
            </div>
        </div>
    );
}

function ShortcutCard({ icon: Icon, title, description, color }: any) {
    return (
        <div className="bg-white border border-slate-100 dark:bg-slate-900/50 dark:border-white/5 rounded-[2.5rem] p-8 space-y-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group">
            <div className={`h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
                <Icon className="h-6 w-6" />
            </div>
            <div className="space-y-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest italic">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {description}
                </p>
            </div>
        </div>
    );
}
