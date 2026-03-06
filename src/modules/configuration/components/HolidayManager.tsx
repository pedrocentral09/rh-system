'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { getHolidays, createHoliday, deleteHoliday } from '../actions/holidays';

interface Holiday {
    id: string;
    date: Date | string;
    name: string;
}

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function HolidayManager() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

    const loadData = async () => {
        setLoading(true);
        const result = await getHolidays();
        if (result.success) {
            setHolidays(result.data || []);
        } else {
            toast.error('Erro ao carregar feriados');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!newHoliday.date || !newHoliday.name) {
            return toast.error('Preencha data e nome');
        }

        setLoading(true);
        const result = await createHoliday(newHoliday);
        if (result.success) {
            toast.success('Feriado adicionado');
            setNewHoliday({ date: '', name: '' });
            loadData();
        } else {
            toast.error('Erro ao criar feriado');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Deseja excluir o feriado "${name}"?`)) return;

        setLoading(true);
        const result = await deleteHoliday(id);
        if (result.success) {
            toast.success('Excluído com sucesso');
            loadData();
        } else {
            toast.error('Erro ao excluir');
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-700">
            {/* Form Column */}
            <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
                <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-brand-orange/5 blur-[40px] rounded-full -ml-16 -mt-16 pointer-events-none" />

                    <div className="relative space-y-6">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Agendar <span className="text-brand-orange">Feriado</span></h3>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Configuração de Calendário Oficial</p>
                        </div>

                        <div className="space-y-4 pt-4">
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Data de Referência</label>
                                <Input
                                    type="date"
                                    className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white focus:border-brand-orange/30 transition-all font-mono"
                                    value={newHoliday.date}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Título do Evento</label>
                                <Input
                                    className="bg-white/5 border-white/10 rounded-2xl h-12 text-sm font-bold text-white focus:border-brand-orange/30 transition-all"
                                    value={newHoliday.name}
                                    onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                    placeholder="Ex: Confraternização Universal"
                                />
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="w-full h-12 rounded-2xl bg-brand-orange text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-brand-orange/90 transition-all shadow-[0_0_20px_rgba(255,102,0,0.2)] flex items-center justify-center gap-2 group mt-2"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <span className="text-lg group-hover:scale-125 transition-transform duration-300">📅</span>
                                )}
                                Salvar no Calendário
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* List Column */}
            <div className="lg:col-span-8">
                <div className="bg-[#0A0F1C]/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative">
                    <div className="space-y-4">
                        <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                            <div className="col-span-4">Data Calendário</div>
                            <div className="col-span-6">Identificação do Feriado</div>
                            <div className="col-span-2 text-right">Controle</div>
                        </div>

                        <div className="space-y-3">
                            <AnimatePresence mode="popLayout">
                                {holidays.map((h, i) => (
                                    <motion.div
                                        key={h.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="grid grid-cols-12 items-center px-8 py-5 bg-[#0A0F1C] border border-white/5 rounded-[1.5rem] hover:border-brand-orange/30 hover:scale-[1.01] hover:bg-white/[0.02] transition-all duration-300 group"
                                    >
                                        <div className="col-span-4 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex flex-col items-center justify-center border border-white/5 group-hover:border-brand-orange/30 transition-colors">
                                                <span className="text-[14px] font-black text-white font-mono leading-none">
                                                    {new Date(h.date).getUTCDate()}
                                                </span>
                                                <span className="text-[7px] font-black text-slate-600 uppercase">
                                                    {new Date(h.date).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' })}
                                                </span>
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                                                {new Date(h.date).toLocaleDateString('pt-BR', { year: 'numeric', timeZone: 'UTC' })}
                                            </span>
                                        </div>

                                        <div className="col-span-6 min-w-0">
                                            <h4 className="text-[13px] font-black text-white uppercase tracking-tight group-hover:text-brand-orange transition-colors truncate">
                                                {h.name}
                                            </h4>
                                        </div>

                                        <div className="col-span-2 flex justify-end">
                                            <button
                                                onClick={() => handleDelete(h.id, h.name)}
                                                className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-lg text-red-500/50 hover:text-white"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {loading && holidays.length === 0 && (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-white/5 rounded-[1.5rem] animate-pulse" />
                                    ))}
                                </div>
                            )}

                            {!loading && holidays.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-600 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Calendário de exceções vazio</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
