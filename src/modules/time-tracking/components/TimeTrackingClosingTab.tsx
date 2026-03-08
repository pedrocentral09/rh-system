'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Loader2, Lock, CheckCircle, AlertTriangle, Printer } from 'lucide-react';
import { getEmployees } from '@/modules/personnel/actions/employees';
import { closeTimeSheet, getClosingStatus, getClosedPeriods } from '@/modules/time-tracking/actions/closing';
import { getTimeSheet } from '@/modules/time-tracking/actions/timesheet';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function TimeTrackingClosingTab() {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth()); // 0-11
    const [year, setYear] = useState(today.getFullYear());

    const [status, setStatus] = useState<'IDLE' | 'FETCHING' | 'CONFIRM' | 'CLOSING' | 'DONE'>('IDLE');
    const [employees, setEmployees] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);
    const [results, setResults] = useState<{ success: number, fail: number }>({ success: 0, fail: 0 });
    const [processedEmployees, setProcessedEmployees] = useState<any[]>([]);

    // History State
    const [history, setHistory] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        loadHistory();
    }, [status]); // Reload when status changes (e.g. after a close)

    async function loadHistory() {
        setLoadingHistory(true);
        const res = await getClosedPeriods();
        if (res.success) {
            setHistory(res.data || []);
        }
        setLoadingHistory(false);
    }

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    async function handleAnalyze() {
        setStatus('FETCHING');
        const res = await getEmployees();
        if (res.data) {
            const active = res.data.filter((e: any) => e.status === 'ACTIVE');
            setEmployees(active);
            setStatus('CONFIRM');
        } else {
            toast.error('Erro ao buscar funcionários');
            setStatus('IDLE');
        }
    }

    async function executeBulkClose() {
        if (!confirm(`Confirma o fechamento para ${employees.length} funcionários?`)) return;

        setStatus('CLOSING');
        setProgress(0);
        setProcessedEmployees([]);
        let s = 0;
        let f = 0;
        const tempProcessed: any[] = [];

        for (let i = 0; i < employees.length; i++) {
            const emp = employees[i];
            try {
                const check = await getClosingStatus(emp.id, month + 1, year);
                if (check && check.data) {
                    s++;
                    tempProcessed.push({ ...emp, status: 'ALREADY_CLOSED' });
                } else {
                    const sheet = await getTimeSheet(emp.id, month, year);
                    const balance = sheet.success && sheet.data ? sheet.data.totalBalance : 0;

                    const closeRes = await closeTimeSheet(emp.id, month + 1, year, balance);
                    if (closeRes.success) {
                        s++;
                        tempProcessed.push({ ...emp, status: 'CLOSED_NOW' });
                    } else {
                        f++;
                    }
                }
            } catch (err) {
                f++;
                console.error(err);
            }

            setProcessedEmployees([...tempProcessed]);
            setProgress(Math.round(((i + 1) / employees.length) * 100));
        }

        setResults({ success: s, fail: f });
        setStatus('DONE');
        toast.success(`Processo finalizado: ${s} fechados, ${f} erros.`);
        loadHistory();
    }

    const groupedHistory = history.reduce((acc: any, curr: any) => {
        const key = `${curr.month}/${curr.year}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(curr);
        return acc;
    }, {});

    return (
        <div className="space-y-12 max-w-5xl mx-auto animate-in fade-in duration-700">
            {/* Control Panel */}
            <div className="bg-surface/60 backdrop-blur-xl border border-border rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center">
                                <Lock className="h-5 w-5 text-brand-orange" />
                            </div>
                            <h2 className="text-xl font-black text-text-primary uppercase tracking-tight">Fechamento Estratégico em Massa</h2>
                        </div>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-14">Homologação de Ciclo e Consolidação de Saldos Mensais</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-end gap-6 border-t border-border pt-8">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Ciclo (Mês)</label>
                            <select
                                className="h-14 w-48 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none"
                                value={month}
                                onChange={(e) => { setMonth(parseInt(e.target.value)); setStatus('IDLE'); }}
                                disabled={status === 'CLOSING'}
                            >
                                {months.map((m, i) => <option key={i} value={i} className="bg-surface">{m}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] ml-4 group-focus-within:text-brand-orange transition-colors">Ano</label>
                            <select
                                className="h-14 w-32 bg-text-primary/5 border border-border rounded-2xl px-6 text-[11px] font-black text-text-primary uppercase tracking-widest focus:border-brand-orange/30 transition-all cursor-pointer shadow-inner appearance-none"
                                value={year}
                                onChange={(e) => { setYear(parseInt(e.target.value)); setStatus('IDLE'); }}
                                disabled={status === 'CLOSING'}
                            >
                                <option value={2024} className="bg-surface">2024</option>
                                <option value={2025} className="bg-surface">2025</option>
                                <option value={2026} className="bg-surface">2026</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAnalyze}
                            disabled={status !== 'IDLE'}
                            className="h-14 px-10 rounded-2xl bg-text-primary text-surface text-[11px] font-black uppercase tracking-[0.2em] hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
                        >
                            {status === 'FETCHING' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Analisar Pendências'}
                        </button>
                    </div>

                    <AnimatePresence>
                        {status === 'CONFIRM' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-amber-500/5 border border-amber-500/10 p-8 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6"
                            >
                                <div className="flex gap-4 items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">Pronto para Consolidar?</p>
                                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mt-1">Serão processados <span className="text-amber-500">{employees.length}</span> colaboradores ativos</p>
                                    </div>
                                </div>
                                <button
                                    onClick={executeBulkClose}
                                    className="h-14 px-10 rounded-2xl bg-amber-500 text-surface text-[11px] font-black uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-lg active:scale-95"
                                >
                                    Executar Fechamento Geral
                                </button>
                            </motion.div>
                        )}

                        {status === 'CLOSING' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-6 py-4"
                            >
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Processamento em tempo real...</p>
                                        <p className="text-2xl font-black text-text-primary tracking-tighter">{progress}%</p>
                                    </div>
                                    <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest">Estabilizando Banco de Dados</span>
                                </div>
                                <div className="h-2 bg-text-primary/5 rounded-full overflow-hidden border border-border">
                                    <motion.div
                                        className="h-full bg-brand-orange shadow-[0_0_15px_rgba(var(--brand-orange-rgb),0.5)]"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </motion.div>
                        )}

                        {status === 'DONE' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-emerald-500/5 border border-emerald-500/20 p-10 rounded-[2rem] text-center space-y-8"
                            >
                                <div className="space-y-3">
                                    <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20">
                                        <CheckCircle className="h-8 w-8 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight uppercase">Operação Finalizada</h3>
                                    <p className="text-[11px] font-bold text-text-muted uppercase tracking-widest">
                                        {results.success} Fechamentos com Sucesso <span className="mx-4 opacity-20">|</span> <span className="text-red-500">{results.fail} Falhas Detectadas</span>
                                    </p>
                                </div>

                                <div className="bg-surface/80 border border-border rounded-3xl overflow-hidden text-left relative">
                                    <div className="bg-text-primary/5 px-6 py-4 border-b border-border">
                                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest italic">Folhas Prontas para Auditoria</span>
                                    </div>
                                    <div className="max-h-60 overflow-y-auto divide-y divide-border custom-scrollbar">
                                        {processedEmployees.map(emp => (
                                            <div key={emp.id} className="px-6 py-4 flex justify-between items-center hover:bg-text-primary/2 transition-colors group">
                                                <div>
                                                    <p className="text-[12px] font-black text-text-primary uppercase tracking-tight group-hover:text-brand-orange transition-colors">{emp.name}</p>
                                                    <p className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest">{emp.role}</p>
                                                </div>
                                                <button
                                                    onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${emp.id}&month=${month + 1}&year=${year}`, '_blank')}
                                                    className="h-10 px-6 rounded-xl bg-text-primary/5 border border-border text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all flex items-center gap-2"
                                                >
                                                    <Printer className="h-3.5 w-3.5" /> Imprimir
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStatus('IDLE')}
                                    className="px-10 h-14 rounded-2xl bg-text-primary/5 border border-border text-[10px] font-black uppercase tracking-[0.2em] text-text-primary hover:bg-text-primary/10 transition-all"
                                >
                                    Novo Ciclo de Fechamento
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* History Feed */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 px-6">
                    <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.4em]">Auditória de Fechamentos</h3>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {history.length === 0 && !loadingHistory && (
                        <div className="text-center py-20 text-text-muted/40 bg-text-primary/2 rounded-[2.5rem] border border-border border-dashed">
                            <Lock className="h-12 w-12 mb-6 mx-auto opacity-10" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Vácuo Histórico - Comece a Consolidar</p>
                        </div>
                    )}

                    {loadingHistory && (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-brand-orange/40" />
                        </div>
                    )}

                    {Object.keys(groupedHistory).map((key, i) => {
                        const [m, y] = key.split('/');
                        const items = groupedHistory[key];
                        const monthName = months[parseInt(m) - 1];

                        return (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-surface/40 border border-border rounded-[2rem] overflow-hidden hover:border-brand-orange/20 transition-all group"
                            >
                                <div className="bg-text-primary/5 px-8 py-5 border-b border-border flex flex-col md:flex-row justify-between items-center gap-4 group-hover:bg-text-primary/[0.07] transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="bg-brand-orange/10 p-3 rounded-2xl border border-brand-orange/20">
                                            <span className="text-sm font-black text-brand-orange">{y}</span>
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-text-primary tracking-widest uppercase leading-none mb-1">{monthName}</h4>
                                            <span className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em]">{items.length} Funcionários Consolidados</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.open(`/dashboard/time-tracking/print?month=${m}&year=${y}&bulk=true`, '_blank')}
                                        className="h-11 px-8 rounded-xl bg-text-primary/5 border border-border text-[9px] font-black uppercase tracking-widest text-text-muted hover:text-text-primary hover:bg-brand-orange transition-all flex items-center gap-3 group/btn shadow-xl active:scale-95"
                                    >
                                        <Printer className="h-4 w-4" /> Exportar Lote Completo
                                    </button>
                                </div>

                                <div className="divide-y divide-border max-h-80 overflow-y-auto custom-scrollbar">
                                    {items.map((item: any) => (
                                        <div key={item.id} className="px-8 py-5 flex justify-between items-center hover:bg-text-primary/[0.02] transition-colors group/item">
                                            <div className="flex items-center gap-6">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 shadow-[0_0_8px_rgba(var(--emerald-rgb),0.4)]" />
                                                <div>
                                                    <p className="text-[13px] font-black text-text-primary uppercase tracking-tight group-hover/item:text-brand-orange transition-colors">{item.employee.name}</p>
                                                    <p className="text-[9px] font-bold text-text-muted/60 uppercase tracking-widest mt-1">
                                                        Protocolo em {new Date(item.closedAt).toLocaleDateString('pt-BR')} às {new Date(item.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-8 items-center">
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest h-3">Acúmulo</p>
                                                    <span className={`text-[13px] font-mono font-black ${parseFloat(item.totalBalance) < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                                        {parseFloat(item.totalBalance) > 0 ? '+' : ''}{item.totalBalance}h
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={() => window.open(`/dashboard/time-tracking/print?employeeId=${item.employee.id}&month=${m}&year=${y}`, '_blank')}
                                                    className="w-10 h-10 rounded-xl bg-text-primary/5 border border-border flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-text-primary/10 transition-all shadow-lg active:scale-95"
                                                >
                                                    <Printer className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
