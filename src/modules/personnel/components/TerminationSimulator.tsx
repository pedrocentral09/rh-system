'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Calculator,
    FileWarning,
    Calendar,
    DollarSign,
    TrendingDown,
    Info,
    CheckCircle2,
    AlertTriangle,
    ArrowRight,
    Plus,
    RefreshCw
} from 'lucide-react';
import { formatSafeDate } from '@/shared/utils/date-utils';
import { cn } from '@/lib/utils';
import { getExpiredVacationPeriods } from '@/modules/vacations/actions';

interface TerminationSimulatorProps {
    employee: any;
}

type TerminationType = 'WITHOUT_JUST_CAUSE' | 'WITH_JUST_CAUSE' | 'RESIGNATION' | 'AGREEMENT';

export function TerminationSimulator({ employee }: TerminationSimulatorProps) {
    const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TerminationType>('WITHOUT_JUST_CAUSE');
    const [hasNotice, setHasNotice] = useState(true);
    const [isNoticeWorked, setIsNoticeWorked] = useState(false);
    const [expiredVacationPeriods, setExpiredVacationPeriods] = useState(0);
    const [isLoadingVacation, setIsLoadingVacation] = useState(false);

    useEffect(() => {
        const fetchVacation = async () => {
            if (!employee?.id) return;
            setIsLoadingVacation(true);
            const res = await getExpiredVacationPeriods(employee.id);
            if (res.success) {
                setExpiredVacationPeriods(res.count || 0);
            }
            setIsLoadingVacation(false);
        };
        fetchVacation();
    }, [employee?.id]);

    const baseSalary = Number(employee.contract?.baseSalary || 0);
    const admissionDate = new Date(employee.contract?.admissionDate || employee.hireDate);

    const results = useMemo(() => {
        const end = new Date(terminationDate);
        const start = admissionDate;

        if (end < start) return null;

        const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        const daysInLastMonth = end.getDate();

        // 1. Saldo de Salário
        const salaryBalance = (baseSalary / 30) * daysInLastMonth;

        // 2. 13º Salário Proporcional
        const yearMonths = end.getMonth() + (end.getDate() >= 15 ? 1 : 0);
        const thirteethSalary = (baseSalary / 12) * yearMonths;

        // 3. Férias Proporcionais
        // Calculation of "avos": months completed in the current anniversary period
        let avosVacation = monthsDiff % 12;
        if (end.getDate() >= 15) avosVacation += 1;
        const proportionalVacation = (baseSalary / 12) * avosVacation;
        const vacationThird = proportionalVacation / 3;

        // 4. Férias Vencidas
        const expiredVacationValue = baseSalary * expiredVacationPeriods;
        const expiredVacationThird = expiredVacationValue / 3;

        // 5. Aviso Prévio (Simplified: 30 days + 3 days per year)
        const yearsWorked = Math.floor(monthsDiff / 12);
        const noticeDays = 30 + (Math.min(yearsWorked, 20) * 3);
        const noticeValue = (baseSalary / 30) * noticeDays;

        // 6. FGTS Simulation (8% of salary each month)
        const estimatedTotalFGTS = baseSalary * 0.08 * (monthsDiff + 1);
        const fgtsPenalty = estimatedTotalFGTS * 0.40;

        let total = salaryBalance + thirteethSalary + proportionalVacation + vacationThird + expiredVacationValue + expiredVacationThird;

        const breakdown = [
            { label: 'Saldo de Salário', value: salaryBalance, info: `${daysInLastMonth} dias trabalhados` },
            { label: '13º Salário Proporcional', value: thirteethSalary, info: `${yearMonths}/12 avos` },
        ];

        if (expiredVacationPeriods > 0) {
            breakdown.push({ label: 'Férias Vencidas', value: expiredVacationValue, info: `${expiredVacationPeriods} período(s) integral(is)` });
            breakdown.push({ label: '1/3 Férias Vencidas', value: expiredVacationThird, info: '33.3% sobre vencidas' });
        }

        breakdown.push({ label: 'Férias Proporcionais', value: proportionalVacation, info: `${avosVacation}/12 avos` });
        breakdown.push({ label: '1/3 Férias Proporcionais', value: vacationThird, info: '33.3% sobre proporcionais' });

        if (type === 'WITHOUT_JUST_CAUSE') {
            if (hasNotice && !isNoticeWorked) {
                breakdown.push({ label: 'Aviso Prévio Indenizado', value: noticeValue, info: `${noticeDays} dias` });
                total += noticeValue;
            }
            breakdown.push({ label: 'Multa FGTS (40% - Estimado)', value: fgtsPenalty, info: 'Baseado no tempo de casa' });
            total += fgtsPenalty;
        } else if (type === 'AGREEMENT') {
            const halfNotice = noticeValue / 2;
            const halfPenalty = fgtsPenalty / 2;
            breakdown.push({ label: 'Aviso Prévio (50%)', value: halfNotice, info: 'Acordo Comum' });
            breakdown.push({ label: 'Multa FGTS (20%)', value: halfPenalty, info: 'Acordo Comum' });
            total += halfNotice + halfPenalty;
        } else if (type === 'WITH_JUST_CAUSE') {
            // Only salary balance and expired vacation (not calculating expired here for simplicity, focusing on proportional)
            return {
                total: salaryBalance,
                breakdown: [{ label: 'Saldo de Salário', value: salaryBalance, info: 'Demissão por Justa Causa' }]
            };
        }

        return { total, breakdown };
    }, [baseSalary, admissionDate, terminationDate, type, hasNotice, isNoticeWorked]);

    return (
        <div className="space-y-8 py-6">
            <header className="flex items-center gap-4 border-b border-border pb-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                    <Calculator className="h-6 w-6 text-rose-500" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter italic">Simulador de <span className="text-rose-500">Rescisão</span></h3>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] opacity-60">Estimativa Técnica de Verbas Rescisórias</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Configurator */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-surface-secondary/40 border border-border p-6 rounded-[2rem] space-y-6 shadow-inner">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar className="h-3 w-3" /> Data Projetada
                            </label>
                            <input
                                type="date"
                                value={terminationDate}
                                onChange={(e) => setTerminationDate(e.target.value)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary outline-none focus:border-rose-500/50 transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1 flex items-center gap-2">
                                <FileWarning className="h-3 w-3" /> Tipo de Desligamento
                            </label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value as TerminationType)}
                                className="w-full h-12 px-4 rounded-xl bg-surface border border-border text-xs font-bold text-text-primary outline-none focus:border-rose-500/50 transition-all"
                            >
                                <option value="WITHOUT_JUST_CAUSE">Sem Justa Causa (Empregador)</option>
                                <option value="WITH_JUST_CAUSE">Com Justa Causa</option>
                                <option value="RESIGNATION">Pedido de Demissão (Empregado)</option>
                                <option value="AGREEMENT">Acordo Comum (Art. 484-A)</option>
                            </select>
                        </div>

                        <div className="p-4 rounded-2xl bg-surface border border-border group hover:border-brand-orange/30 transition-all">
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest flex items-center gap-2">
                                    <Plus className="h-3 w-3" /> Férias Vencidas
                                </label>
                                {isLoadingVacation ? (
                                    <RefreshCw className="h-3 w-3 animate-spin text-brand-orange" />
                                ) : (
                                    <span className="text-[10px] font-black text-brand-orange uppercase bg-brand-orange/10 px-2 py-0.5 rounded-full border border-brand-orange/20">Sincronizado</span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <p className="text-xl font-black text-text-primary">{expiredVacationPeriods}</p>
                                <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest italic">
                                    {expiredVacationPeriods === 1 ? 'Período Integral Localizado' : 'Períodos Integrais Localizados'}
                                </p>
                            </div>
                            <p className="text-[7px] font-black text-text-muted uppercase tracking-tighter mt-2 opacity-60">⚠️ Dados extraídos automaticamente do módulo de gestão de férias</p>
                        </div>

                        {(type === 'WITHOUT_JUST_CAUSE' || type === 'RESIGNATION') && (
                            <div className="pt-2 space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface border border-border group hover:border-rose-500/30 transition-all">
                                    <div>
                                        <p className="text-[10px] font-black text-text-primary uppercase">Cumprir Aviso?</p>
                                        <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">O aviso será trabalhado ou indenizado?</p>
                                    </div>
                                    <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
                                        <button
                                            onClick={() => setIsNoticeWorked(true)}
                                            className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", isNoticeWorked ? "bg-rose-500 text-white shadow-lg" : "text-text-muted")}
                                        >Trabalhado</button>
                                        <button
                                            onClick={() => setIsNoticeWorked(false)}
                                            className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all", !isNoticeWorked ? "bg-rose-500 text-white shadow-lg" : "text-text-muted")}
                                        >Indenizado</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 rounded-[2rem] bg-brand-blue/5 border border-brand-blue/10 space-y-3">
                        <div className="flex items-center gap-2 text-brand-blue">
                            <Info className="h-4 w-4" />
                            <h4 className="text-[10px] font-black uppercase tracking-widest">Base de Cálculo</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[8px] font-black text-text-muted uppercase">Salário Base</p>
                                <p className="text-sm font-bold text-text-primary">R$ {baseSalary.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-text-muted uppercase">Admissão</p>
                                <p className="text-sm font-bold text-text-primary">{formatSafeDate(admissionDate)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="lg:col-span-7">
                    <div className="bg-surface border border-border rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden h-full flex flex-col">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/5 blur-[60px] rounded-full -mr-24 -mt-24 pointer-events-none" />

                        <div className="relative z-10 mb-8">
                            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-6">Detalhamento de Proventos</h4>

                            <div className="space-y-3">
                                {results?.breakdown.map((item, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        key={i}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-surface-secondary/30 border border-white/5 hover:border-border transition-all"
                                    >
                                        <div>
                                            <p className="text-[10px] font-black text-text-primary uppercase tracking-tight">{item.label}</p>
                                            <p className="text-[8px] font-bold text-text-muted uppercase tracking-widest">{item.info}</p>
                                        </div>
                                        <p className="text-sm font-black text-text-primary">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto pt-8 border-t border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-1">Total Bruto Estimado</p>
                                    <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest italic flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Valores sem descontos de INSS/IRRF
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-[1000] text-rose-500 tracking-tighter italic">
                                        R$ {results?.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => window.print()}
                                className="w-full h-14 mt-8 rounded-2xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-900 transition-all border border-white/10"
                            >
                                <ArrowRight className="h-4 w-4" /> Exportar Demonstrativo de Simulação
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-[9px] text-amber-500/80 font-bold uppercase tracking-tight leading-relaxed text-center italic">
                    ⚠️ Atenção: Esta é uma simulação matemática baseada em parâmetros padrões da CLT. Não substitui o cálculo oficial do contador ou sistema de folha de pagamento. Descontos obrigatórios (INSS, IRRF, Faltas, Vale Transporte) não foram subtraídos deste total.
                </p>
            </div>
        </div>
    );
}
