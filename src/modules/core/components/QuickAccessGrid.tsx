'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Users2, Megaphone, Clock, BarChart3, MessageSquare, LineChart, ArrowRight } from 'lucide-react';

export function QuickAccessGrid() {
    const links = [
        { href: '/dashboard/personnel', label: 'Gestão de Pessoal', icon: <Users2 className="w-8 h-8" />, color: 'orange', desc: 'Funcionários, admissões e documentos estratégicos.', from: 'from-orange-500/20' },
        { href: '/dashboard/recruitment', label: 'Recrutamento', icon: <Megaphone className="w-8 h-8" />, color: 'blue', desc: 'Vagas, candidatos e funil de seleção otimizado.', from: 'from-blue-500/20' },
        { href: '/dashboard/time-tracking', label: 'Controle de Ponto', icon: <Clock className="w-8 h-8" />, color: 'emerald', desc: 'Importar AFDs e gerenciar batidas em tempo real.', from: 'from-emerald-500/20' },
        { href: '/dashboard/performance/cycles', label: 'Desempenho', icon: <BarChart3 className="w-8 h-8" />, color: 'indigo', desc: 'Ciclos de avaliação, OKRs e feedbacks contínuos.', from: 'from-indigo-500/20' },
        { href: '/dashboard/communications', label: 'Suporte Interno', icon: <MessageSquare className="w-8 h-8" />, color: 'rose', desc: 'Comunicados, mensagens diretas e base de conhecimento.', from: 'from-rose-500/20' },
        { href: '/dashboard/configuration', label: 'Estratégia & Analytics', icon: <LineChart className="w-8 h-8" />, color: 'amber', desc: 'Indicadores chave, relatórios e dashboard gerencial.', from: 'from-amber-500/20' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {links.map((link, i) => (
                <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link href={link.href} className="block group h-full">
                        <div className="relative h-full overflow-hidden bg-surface/50 backdrop-blur-md border border-border rounded-[2.5rem] p-8 transition-all duration-500 hover:border-brand-orange/40 hover:-translate-y-2 hover:shadow-2xl dark:hover:shadow-brand-orange/5">
                            {/* Decorative Background */}
                            <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${link.from} to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000`} />
                            
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-surface-secondary border border-border rounded-3xl flex items-center justify-center mb-6 group-hover:bg-brand-orange group-hover:border-transparent group-hover:text-white transition-all duration-500 shadow-sm">
                                    {link.icon}
                                </div>
                                
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tight mb-3 group-hover:text-brand-orange transition-colors">
                                    {link.label}
                                </h3>
                                
                                <p className="text-sm text-text-muted leading-relaxed font-medium mb-8">
                                    {link.desc}
                                </p>
                                
                                <div className="mt-auto flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted group-hover:text-brand-orange transition-colors">
                                    <div className="h-px w-8 bg-border group-hover:bg-brand-orange group-hover:w-12 transition-all duration-500" />
                                    <span>Explorar Módulo</span>
                                    <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
