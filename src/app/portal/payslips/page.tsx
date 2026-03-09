'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getEmployeePayslips } from '@/modules/payroll/actions/employee-portal';
import { FileText, Download, Wallet, Clock, ChevronRight, Loader2, ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/shared/components/ui/button';

export default function PortalPayslipsPage() {
    const [payslips, setPayslips] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getEmployeePayslips();
            if (res.success) setPayslips(res.data || []);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) return (
        <div className="h-[80vh] flex flex-col items-center justify-center gap-6">
            <Loader2 className="h-14 w-14 animate-spin text-emerald-400" />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Compilando Extrato Financeiro...</p>
        </div>
    );

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-10 max-w-6xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-1 w-8 bg-emerald-400" />
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">Finanças Pessoais</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/portal" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter italic">Meus <span className="text-slate-500">Holerites</span></h2>
                    </div>
                </div>

                <div className="bg-emerald-500/10 p-5 rounded-3xl border border-emerald-500/20 backdrop-blur-xl flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                        <TrendingUp className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-white uppercase tracking-widest">Último Rendimento Líquido</p>
                        <p className="text-xl font-black text-emerald-400 tracking-tight">{payslips.length > 0 ? formatCurrency(Number(payslips[0].netSalary)) : 'R$ 0,00'}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {payslips.map((pay: any, i: number) => (
                    <motion.div
                        key={pay.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="group bg-[#111624] border border-white/5 hover:border-emerald-500/30 rounded-[32px] p-2 pr-8 flex items-center gap-8 transition-all duration-500 shadow-2xl"
                    >
                        <div className="h-20 w-20 rounded-[28px] bg-emerald-500/10 flex items-center justify-center border border-white/5 group-hover:scale-95 transition-transform duration-500">
                            <Wallet className="h-8 w-8 text-emerald-400" />
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Período de Referência</p>
                                <h4 className="text-lg font-[1000] text-white uppercase tracking-tight italic">
                                    {new Date(0, pay.period.month - 1).toLocaleDateString('pt-BR', { month: 'long' })} / {pay.period.year}
                                </h4>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Rendimento Bruto</p>
                                <p className="text-sm font-bold text-slate-300">{formatCurrency(Number(pay.grossSalary))}</p>
                            </div>

                            <div className="space-y-1">
                                <p className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest">Valor Líquido</p>
                                <p className="text-xl font-black text-emerald-400 tracking-tighter">{formatCurrency(Number(pay.netSalary))}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button className="h-14 px-8 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 border border-white/10 transition-all">
                                <Download className="h-4 w-4" />
                                Download PDF
                            </Button>
                        </div>
                    </motion.div>
                ))}

                {payslips.length === 0 && (
                    <div className="h-96 bg-white/[0.02] border border-white/5 border-dashed rounded-[48px] flex flex-col items-center justify-center text-center p-10">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-slate-700" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2">Histórico Vazio</h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm leading-relaxed">
                            Nenhum holerite foi processado para sua conta até o momento.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
