'use client';

import { motion } from 'framer-motion';

interface SectorStats {
    name: string;
    count: number;
    percentage: number;
}

interface SectorDistributionProps {
    stats: SectorStats[];
}

export function SectorDistribution({ stats }: SectorDistributionProps) {
    return (
        <div className="space-y-6">
            {(stats || []).slice(0, 5).map((dept) => (
                <div key={dept.name} className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider">
                        <span className="text-text-secondary">{dept.name}</span>
                        <span className="text-brand-orange">{dept.percentage}%</span>
                    </div>
                    <div className="h-1 bg-surface-secondary border border-border/10 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${dept.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                            className="h-full bg-gradient-to-r from-brand-orange to-orange-400 rounded-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
