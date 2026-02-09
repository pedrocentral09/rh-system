'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface StatsGridProps {
    stats: {
        totalEmployees: number;
        activeEmployees: number;
        storeCount: number;
        departmentCount: number;
    };
}

export function DashboardStatsGrid({ stats }: StatsGridProps) {
    const items = [
        { label: 'Total Colaboradores', value: stats.totalEmployees, color: 'orange', sub: 'Cadastrados no sistema' },
        { label: 'Ativos', value: stats.activeEmployees, color: 'emerald', sub: 'Atualmente trabalhando' },
        { label: 'Lojas / Unidades', value: stats.storeCount, color: 'blue', sub: 'Lojas ativas com equipe' },
        { label: 'Departamentos', value: stats.departmentCount, color: 'amber', sub: 'Setores operacionais' }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item, i) => (
                <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                >
                    <Card className={`border-none rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] bg-white dark:bg-slate-900 border-t-4 border-${item.color}-500`}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-black text-slate-900 dark:text-white`}>{item.value}</div>
                            <p className="text-[10px] text-slate-500 font-medium uppercase mt-1">{item.sub}</p>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
