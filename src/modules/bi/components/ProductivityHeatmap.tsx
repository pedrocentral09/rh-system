'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProductivityHeatmapAction } from '../actions/stats';
import { Loader2, Info } from 'lucide-react';

export function ProductivityHeatmap({ storeId }: { storeId?: string }) {
    const [data, setData] = useState<number[][] | null>(null);
    const [loading, setLoading] = useState(true);

    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}h`);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getProductivityHeatmapAction({ storeId });
            if (res.success) setData(res.data);
            setLoading(false);
        }
        load();
    }, [storeId]);

    const getMax = () => {
        if (!data) return 1;
        return Math.max(...data.flat(), 1);
    };

    const getOpacity = (value: number) => {
        if (value === 0) return 0.05;
        const max = getMax();
        return 0.1 + (value / max) * 0.9;
    };

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-4 text-text-muted">
            <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
            <p className="text-[10px] font-black uppercase tracking-widest">Mapeando Fluxo Operacional...</p>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
                    Heatmap de Atividade Horária
                </h4>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-sm bg-brand-orange opacity-10" />
                        <span className="text-[8px] font-bold text-text-muted uppercase">Baixo</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-sm bg-brand-orange opacity-100" />
                        <span className="text-[8px] font-bold text-text-muted uppercase">Pico</span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar pb-4">
                <div className="min-w-[800px]">
                    <div className="grid grid-cols-[60px_1fr] gap-4">
                        {/* Hours Header */}
                        <div />
                        <div className="grid grid-cols-24 gap-1">
                            {hours.map(h => (
                                <span key={h} className="text-[8px] font-black text-text-muted text-center uppercase tracking-tighter">{h}</span>
                            ))}
                        </div>

                        {/* Rows */}
                        {data?.map((row, dIdx) => (
                            <div key={days[dIdx]} className="contents group">
                                <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center group-hover:text-brand-orange transition-colors">
                                    {days[dIdx]}
                                </span>
                                <div className="grid grid-cols-24 gap-1">
                                    {row.map((val, hIdx) => (
                                        <motion.div
                                            key={`${dIdx}-${hIdx}`}
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: (dIdx * 24 + hIdx) * 0.001 }}
                                            className="h-8 rounded-md bg-brand-orange relative cursor-pointer group/cell"
                                            style={{ opacity: getOpacity(val) }}
                                            title={`${days[dIdx]}, ${hours[hIdx]}: ${val} batidas`}
                                        >
                                            {val > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className={`text-[7px] font-black ${val / getMax() > 0.5 ? 'text-white' : 'text-text-primary'} opacity-0 group-hover/cell:opacity-100 transition-opacity`}>
                                                        {val}
                                                    </span>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-4 p-6 bg-brand-orange/5 border border-brand-orange/10 rounded-3xl">
                <Info className="h-5 w-5 text-brand-orange shrink-0" />
                <p className="text-[9px] font-bold text-brand-orange uppercase tracking-widest leading-relaxed">
                    A análise de calor indica os períodos de maior incidência de batidas de ponto. Use este dado para ajustar escalas de revezamento e otimizar a presença da equipe em horários de pico comercial.
                </p>
            </div>
        </div>
    );
}
