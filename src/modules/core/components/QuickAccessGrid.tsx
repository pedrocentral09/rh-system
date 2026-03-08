'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export function QuickAccessGrid() {
    const links = [
        { href: '/dashboard/personnel', label: 'Gestão de Pessoal', icon: '👥', color: 'orange', desc: 'Funcionários, admissões e documentos estratégicos.', from: 'from-orange-500/10' },
        { href: '/dashboard/recruitment', label: 'Recrutamento', icon: '📢', color: 'blue', desc: 'Vagas, candidatos e funil de seleção otimizado.', from: 'from-blue-500/10' },
        { href: '/dashboard/time-tracking', label: 'Controle de Ponto', icon: '⏰', color: 'emerald', desc: 'Importar AFDs e gerenciar batidas em tempo real.', from: 'from-emerald-500/10' },
        { href: '/dashboard/performance/cycles', label: 'Desempenho', icon: '📊', color: 'indigo', desc: 'Ciclos de avaliação, OKRs e feedbacks contínuos.', from: 'from-indigo-500/10' },
        { href: '/dashboard/communications', label: 'Atendimento', icon: '💬', color: 'rose', desc: 'Suporte interno, comunicados e mensagens diretas.', from: 'from-rose-500/10' },
        { href: '/dashboard/configuration', label: 'Analytics', icon: '📈', color: 'amber', desc: 'Indicadores, relatórios e dashboard gerencial.', from: 'from-amber-500/10' }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
            {links.map((link, i) => (
                <motion.div
                    key={link.label}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link href={link.href} className="block group h-full">
                        <div className={`relative h-full overflow-hidden bg-surface border border-border rounded-[2.5rem] p-10 transition-all duration-700 hover:border-brand-orange/30 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] shadow-2xl`}>
                            {/* Premium Background Effects */}
                            <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br ${link.from} to-transparent rounded-full blur-[80px] group-hover:scale-125 transition-transform duration-1000`} />

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="w-16 h-16 bg-surface-secondary border border-border rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:bg-brand-orange group-hover:border-transparent group-hover:shadow-[0_0_30px_rgba(255,120,0,0.2)] transition-all duration-500">
                                    <span className="text-4xl group-hover:scale-110 transition-transform">{link.icon}</span>
                                </div>

                                <h3 className="text-base font-black text-text-primary uppercase tracking-[0.1em] mb-4 group-hover:text-brand-orange transition-colors">
                                    {link.label}
                                </h3>

                                <p className="text-[13px] text-text-secondary leading-relaxed font-bold group-hover:text-text-primary transition-colors">
                                    {link.desc}
                                </p>

                                <div className="mt-auto pt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted group-hover:text-brand-orange transition-colors">
                                    <span>Acessar Módulo</span>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" className="transform group-hover:translate-x-1 transition-transform"><path d="M5 12h14m-7-7 7 7-7 7" /></svg>
                                </div>
                            </div>

                            {/* Corner Decorative Element */}
                            <div className="absolute top-0 right-0 w-24 h-24 pointer-events-none overflow-hidden">
                                <div className="absolute top-[-50px] right-[-50px] w-24 h-24 border border-white/[0.03] rounded-full group-hover:border-brand-orange/10 transition-colors duration-700" />
                            </div>
                        </div>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
