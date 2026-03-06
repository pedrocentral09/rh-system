'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { getOrphanPunches } from '../actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ShieldAlert, RefreshCw, UserPlus, Search } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { Input } from '@/shared/components/ui/input';

import { motion, AnimatePresence } from 'framer-motion';

export function OrphanPunchesTab() {
    const [orphans, setOrphans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrphans = async () => {
        setLoading(true);
        const res = await getOrphanPunches();
        if (res.success && res.data) {
            setOrphans(res.data);
        } else {
            toast.error('Erro ao carregar registros sem vínculo.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchOrphans();
    }, []);

    const filtered = orphans.filter(o => o.pis.includes(searchTerm));

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Premium Header/Status Panel */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#0A0F1C]/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="flex flex-col gap-2 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <ShieldAlert className="h-5 w-5 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Vácuo de Identidade Operacional</h2>
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-14">Registros via PIS/CPF detectados sem vínculo com Colaboradores ativos</p>
                </div>

                <div className="flex items-center gap-4 z-10 overflow-hidden">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-brand-orange transition-colors" />
                        <input
                            type="text"
                            placeholder="FILTRAR POR PIS..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 bg-white/5 border border-white/5 rounded-2xl pl-12 pr-6 text-[10px] font-black text-white uppercase tracking-widest placeholder:text-slate-700 focus:border-brand-orange/30 transition-all shadow-inner w-64"
                        />
                    </div>
                    <button
                        onClick={fetchOrphans}
                        disabled={loading}
                        className="h-12 px-6 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sincronizar
                    </button>
                </div>
            </div>

            {/* List Feed */}
            <div className="space-y-4">
                <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <div className="col-span-4 text-left">PIS / Identificador Digital</div>
                    <div className="col-span-2 text-center">Frequência</div>
                    <div className="col-span-4 text-left ml-4">Última Atividade Detectada</div>
                    <div className="col-span-2 text-right">Ação Estratégica</div>
                </div>

                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="h-20 bg-white/5 rounded-[1.5rem] animate-pulse border border-white/5" />
                            ))
                        ) : filtered.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-slate-700 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed"
                            >
                                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] italic text-center">Integridade Operacional Confirmada - Sem órfãos</p>
                            </motion.div>
                        ) : (
                            filtered.map((item, i) => (
                                <motion.div
                                    key={item.pis}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="bg-[#0A0F1C]/80 border border-white/5 rounded-[1.5rem] px-8 py-5 grid grid-cols-12 items-center hover:border-brand-orange/30 hover:bg-white/[0.02] transition-all duration-300 group"
                                >
                                    <div className="col-span-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center font-mono text-[11px] font-black text-slate-400 group-hover:text-brand-orange transition-colors">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <h4 className="text-[13px] font-mono font-black text-white tracking-tight uppercase group-hover:text-brand-orange transition-colors">{item.pis}</h4>
                                            <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Identificador Não Mapeado</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 text-center">
                                        <div className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-black text-amber-500 uppercase tracking-widest">
                                            {item.count} BATIDAS
                                        </div>
                                    </div>

                                    <div className="col-span-4 ml-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[12px] font-black text-slate-300 uppercase tracking-tight">
                                                {format(new Date(item.lastSeen), "dd MMM yyyy", { locale: ptBR })}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">Consolidado às {item.lastTime}</span>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-500">
                                        <button className="h-11 px-6 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-[0.1em] hover:bg-brand-orange hover:text-white transition-all shadow-xl active:scale-95 flex items-center gap-2">
                                            <UserPlus className="w-3.5 h-3.5" /> Vincular RH
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
