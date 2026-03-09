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
        <div className="space-y-8">
            {(stats || []).slice(0, 6).map((dept, index) => (
                <motion.div
                    key={dept.name}
                    className="space-y-3 group/sector"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                >
                    <div className="flex justify-between text-[11px] font-[1000] uppercase tracking-widest italic leading-none">
                        <span className="text-text-muted group-hover/sector:text-brand-orange transition-colors duration-500">{dept.name}</span>
                        <span className="text-text-primary tabular-nums group-hover/sector:scale-110 transition-transform">{dept.percentage}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.03] rounded-full overflow-hidden relative shadow-inner border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${dept.percentage}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 2, delay: 0.5 + (index * 0.1), ease: "circOut" }}
                            className="h-full bg-gradient-to-r from-brand-orange to-orange-400 relative rounded-full"
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </motion.div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
