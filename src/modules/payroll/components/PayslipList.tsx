
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

import { Loader2, Calculator, Users, Pencil, Printer, Mail, Eye } from 'lucide-react';
import { Badge } from '@/shared/components/ui/badge';
import { PayslipEditModal } from './PayslipEditModal';
import { PayslipViewModal } from './PayslipViewModal';
import Link from 'next/link';
import { sendPayslipByEmail } from '../actions/email';
import { calculateAllPayslips, calculatePayslip } from '../actions/calculation';
import { motion, AnimatePresence } from 'framer-motion';

interface PayslipListProps {
    periodId: string;
    status: string;
    payslips: any[];
}

export function PayslipList({ periodId, status, payslips }: PayslipListProps) {
    const [loading, setLoading] = useState(false);
    const [calculatingId, setCalculatingId] = useState<string | null>(null);
    const [editingPayslip, setEditingPayslip] = useState<any | null>(null);
    const [viewPayslip, setViewPayslip] = useState<any | null>(null);
    const [search, setSearch] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<string>('all');
    const [selectedStore, setSelectedStore] = useState<string>('all');

    // Opções únicas de Empresas e Lojas presentes na lista
    const companies = Array.from(new Set(payslips.map(p => p.employee.contract?.company?.name).filter(Boolean)));
    const stores = Array.from(new Set(payslips.map(p => p.employee.contract?.store?.name).filter(Boolean)));

    async function handleCalculateAll() {
        if (!confirm('Deseja recalcular a folha de TODOS os funcionários? Isso pode demorar.')) return;

        setLoading(true);
        const res = await calculateAllPayslips(periodId);
        setLoading(false);

        if (res.success) {
            toast.success(`Processamento concluído! ${res.processed} recalculados.`);
        } else {
            toast.error('Erro ao processar folha.');
        }
    }

    async function handleCalculateSingle(employeeId: string) {
        setCalculatingId(employeeId);
        const res = await calculatePayslip(employeeId, periodId);
        setCalculatingId(null);

        if (res.success) {
            toast.success('Holerite recalculado!');
        } else {
            toast.error('Erro ao calcular.');
        }
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const filteredPayslips = payslips.filter(p => {
        const matchesSearch = p.employee.name.toLowerCase().includes(search.toLowerCase());
        const matchesCompany = selectedCompany === 'all' || p.employee.contract?.company?.name === selectedCompany;
        const matchesStore = selectedStore === 'all' || p.employee.contract?.store?.name === selectedStore;
        return matchesSearch && matchesCompany && matchesStore;
    });

    // Calc Period Totals based on filtered list
    const periodTotals = filteredPayslips.reduce((acc, p) => ({
        gross: acc.gross + Number(p.grossSalary),
        deductions: acc.deductions + Number(p.totalDeductions),
        net: acc.net + Number(p.netSalary)
    }), { gross: 0, deductions: 0, net: 0 });

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Resumo Financeiro Premium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Proventos Totais', value: periodTotals.gross, color: 'text-white', bg: 'bg-white/5', icon: '💰' },
                    { label: 'Retenções & Descontos', value: periodTotals.deductions, color: 'text-red-400', bg: 'bg-red-500/5', icon: '📉' },
                    { label: 'Disponibilidade Líquida', value: periodTotals.net, color: 'text-emerald-400', bg: 'bg-emerald-500/5', icon: '🛡️' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${stat.bg} backdrop-blur-xl border border-white/5 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group`}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors" />
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-xl">{stat.icon}</span>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{stat.label}</span>
                        </div>
                        <div className={`text-3xl font-black tracking-tighter ${stat.color}`}>
                            {formatCurrency(stat.value)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Controle de Fluxo & Filtros */}
            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-brand-orange transition-colors" />
                        <input
                            type="text"
                            placeholder="PESQUISAR COLABORADOR..."
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-black text-white uppercase tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-brand-orange/30 transition-all shadow-inner"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-3">
                        <select
                            className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 transition-all"
                            value={selectedCompany}
                            onChange={(e) => setSelectedCompany(e.target.value)}
                        >
                            <option value="all" className="bg-[#0A0F1C]">Todas as Empresas</option>
                            {companies.map(c => <option key={c as string} value={c as string} className="bg-[#0A0F1C]">{c as string}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-3">
                        <select
                            className="w-full appearance-none bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer focus:outline-none focus:border-brand-orange/30 transition-all"
                            value={selectedStore}
                            onChange={(e) => setSelectedStore(e.target.value)}
                        >
                            <option value="all" className="bg-[#0A0F1C]">Todas as Lojas</option>
                            {stores.map(s => <option key={s as string} value={s as string} className="bg-[#0A0F1C]">{s as string}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3">
                        <button
                            onClick={async () => {
                                if (!confirm('Enviar e-mail para TODOS os funcionários filtrados?')) return;
                                const { sendAllPayslips } = await import('../actions/batch-email');
                                const res = await sendAllPayslips(periodId);
                                if (res.success) toast.success(res.message);
                                else toast.error(res.error);
                            }}
                            disabled={loading || status === 'CLOSED' || filteredPayslips.length === 0}
                            className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-lg disabled:opacity-30"
                            title="Enviar E-mails em Massa"
                        >
                            <Mail className="h-5 w-5" />
                        </button>
                        <button
                            onClick={handleCalculateAll}
                            disabled={loading || status === 'CLOSED'}
                            className="h-12 px-6 rounded-2xl bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg flex items-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Calculator className="h-4 w-4 group-hover:rotate-12 transition-transform" />}
                            Processar Tudo
                        </button>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                        Registros Processados: <span className="text-slate-400 font-black">{filteredPayslips.length} / {payslips.length}</span>
                    </span>
                </div>
            </div>

            {/* Listagem Premium */}
            <div className="space-y-4">
                <div className="grid grid-cols-12 px-8 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    <div className="col-span-12 md:col-span-4 text-left">Colaborador / Identidade</div>
                    <div className="hidden md:block md:col-span-2 text-center">Bruto</div>
                    <div className="hidden md:block md:col-span-2 text-center">Descontos</div>
                    <div className="hidden md:block md:col-span-2 text-center">Líquido</div>
                    <div className="hidden md:block md:col-span-2 text-right">Comandos</div>
                </div>

                <div className="space-y-3">
                    {filteredPayslips.map((payslip, i) => (
                        <motion.div
                            key={payslip.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            className="bg-[#0A0F1C]/80 border border-white/5 rounded-[1.5rem] px-8 py-5 flex flex-col md:grid md:grid-cols-12 items-center gap-4 hover:border-indigo-500/30 hover:bg-white/[0.02] transition-all duration-300 group"
                        >
                            <div className="col-span-4 flex items-center gap-4 w-full">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner group-hover:border-indigo-500/30 transition-colors">
                                    👤
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[13px] font-black text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors truncate">{payslip.employee.name}</h4>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{payslip.employee.jobTitle}</span>
                                        {payslip.items.some((i: any) => i.source === 'SYNC') && (
                                            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">Sync Ponto</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-2 text-center w-full md:w-auto">
                                <div className="text-[11px] font-black text-slate-400 mt-0.5">{formatCurrency(payslip.grossSalary)}</div>
                            </div>

                            <div className="col-span-2 text-center w-full md:w-auto text-red-500/70 font-bold text-[11px]">
                                {formatCurrency(payslip.totalDeductions)}
                            </div>

                            <div className="col-span-2 text-center w-full md:w-auto">
                                <div className="bg-emerald-500/5 px-4 py-2 rounded-2xl border border-emerald-500/10 inline-block">
                                    <span className="text-sm font-black text-emerald-400 tracking-tighter">{formatCurrency(payslip.netSalary)}</span>
                                </div>
                            </div>

                            <div className="col-span-2 flex justify-end gap-2 w-full md:w-auto">
                                <button onClick={() => setViewPayslip(payslip)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-95" title="Visualizar">👁️</button>
                                <button disabled={status === 'CLOSED'} onClick={() => setEditingPayslip(payslip)} className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all shadow-lg active:scale-95 disabled:opacity-20" title="Editar">✏️</button>
                                <Link href={`/dashboard/payroll/print/${payslip.id}`} target="_blank" className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all shadow-lg active:scale-95">🖨️</Link>
                                <button
                                    onClick={async () => {
                                        if (!confirm(`Enviar por e-mail para ${payslip.employee.name}?`)) return;
                                        const res = await sendPayslipByEmail(payslip.id);
                                        if (res.success) toast.success(res.message);
                                        else toast.error(res.error);
                                    }}
                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-orange-400 transition-all shadow-lg active:scale-95"
                                    title="E-mail"
                                >
                                    📧
                                </button>
                                <button
                                    disabled={calculatingId === payslip.employeeId || status === 'CLOSED'}
                                    onClick={() => handleCalculateSingle(payslip.employeeId)}
                                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-indigo-400 transition-all shadow-lg active:scale-95 disabled:opacity-20"
                                    title="Recalcular"
                                >
                                    {calculatingId === payslip.employeeId ? <Loader2 className="h-4 w-4 animate-spin text-indigo-400" /> : '⚡'}
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {filteredPayslips.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-700 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                            <span className="text-4xl mb-6 opacity-20">📂</span>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">{search ? 'Nenhum resultado filtrado' : 'Folha de pagamento vazia'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals Retainment */}
            {editingPayslip && (
                <PayslipEditModal
                    isOpen={!!editingPayslip}
                    onClose={() => setEditingPayslip(null)}
                    payslip={editingPayslip}
                />
            )}

            {viewPayslip && (
                <PayslipViewModal
                    isOpen={!!viewPayslip}
                    onClose={() => setViewPayslip(null)}
                    payslip={viewPayslip}
                />
            )}
        </div>
    );
}
