'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

export function QuickAccessGrid() {
    const links = [
        { href: '/dashboard/personnel', label: 'Gestão de Pessoal', icon: '👥', color: 'orange', desc: 'Funcionários, admissões e documentos.' },
        { href: '/dashboard/reports', label: 'Relatórios', icon: '📊', color: 'indigo', desc: 'Exportar Turnover, Folha e indicadores.' },
        { href: '/dashboard/scales', label: 'Escalas', icon: '📅', color: 'emerald', desc: 'Turnos, folgas e escalas semanais.' },
        { href: '/dashboard/time-tracking', label: 'Controle de Ponto', icon: '⏰', color: 'blue', desc: 'Importar AFDs e gerenciar batidas.' },
        { href: '/dashboard/configuration', label: 'Configurações', icon: '⚙️', color: 'slate', desc: 'Dados da empresa e preferências.' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
            {links.map((link, i) => (
                <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                >
                    <Link href={link.href} className="block group">
                        <Card className="h-full border-none rounded-none bg-white dark:bg-slate-900 group-hover:bg-slate-950 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all duration-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] group-hover:shadow-[8px_8px_0px_0px_rgba(249,115,22,1)]">
                            <CardHeader>
                                <div className={`w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-none flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <span className="text-2xl">{link.icon}</span>
                                </div>
                                <CardTitle className="text-lg font-black uppercase tracking-tighter">{link.label}</CardTitle>
                                <CardDescription className="text-slate-500 group-hover:text-slate-300 dark:group-hover:text-slate-600 transition-colors">{link.desc}</CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </motion.div>
            ))}
        </div>
    );
}
