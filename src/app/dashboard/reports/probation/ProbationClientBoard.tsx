'use client';

import { useState } from 'react';
import { Search, Clock, AlertTriangle, CheckCircle2, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { formatSafeDate } from '@/shared/utils/date-utils';
import { exportToExcel, exportToPDF } from '@/shared/utils/export-utils';
import { motion, AnimatePresence } from 'framer-motion';

type EmployeeRaw = {
    id: string;
    name: string;
    photoUrl: string | null;
    jobTitle: string | null;
    department: string | null;
    contract: {
        admissionDate: Date;
        experienceDays: number | null;
        isExperienceExtended: boolean;
        experienceExtensionDays: number | null;
        isExperienceExtended2: boolean;
        experienceExtension2Days: number | null;
        store: { name: string } | null;
    } | null;
};

type PeriodInfo = {
    isActive: boolean;
    duration: number;
    startDate: Date;
    endDate: Date;
    daysRemaining: number;
    state: 'PENDING' | 'ACTIVE' | 'EXPIRED';
};

type EmloyeeProcessed = {
    raw: EmployeeRaw;
    p1: PeriodInfo;
    p2: PeriodInfo;
    p3: PeriodInfo;
    finalEndDate: Date;
    globalStatus: 'REGULAR' | 'VENCIDO';
};

export function ProbationClientBoard({ employees }: { employees: EmployeeRaw[] }) {
    const [search, setSearch] = useState('');
    const [storeFilter, setStoreFilter] = useState('ALL');
    const [activeTab, setActiveTab] = useState<'ALL' | 'REGULAR' | 'VENCIDO'>('ALL');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today for comparisons

    const processPeriod = (start: Date, duration: number, isActive: boolean): PeriodInfo => {
        const end = new Date(start);
        end.setDate(start.getDate() + duration);
        end.setHours(0, 0, 0, 0);

        const diffTime = end.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let state: 'PENDING' | 'ACTIVE' | 'EXPIRED' = 'PENDING';
        if (isActive) {
            if (today > end) state = 'EXPIRED';
            else if (today >= start && today <= end) state = 'ACTIVE';
            else state = 'PENDING';
        }

        return { isActive, duration, startDate: start, endDate: end, daysRemaining: diffDays, state };
    };

    const data: EmloyeeProcessed[] = employees.map(emp => {
        const contract = emp.contract!;
        const admission = new Date(contract.admissionDate);
        admission.setHours(0, 0, 0, 0);

        // Period 1
        const p1Duration = contract.experienceDays || 45;
        const p1 = processPeriod(admission, p1Duration, true);

        // Period 2
        const p2Duration = contract.experienceExtensionDays || 0;
        const p2 = processPeriod(p1.endDate, p2Duration, contract.isExperienceExtended);

        // Period 3
        const p3Duration = contract.experienceExtension2Days || 0;
        const p3 = processPeriod(p2.isActive ? p2.endDate : p1.endDate, p3Duration, contract.isExperienceExtended2);

        // Determine Final End Date
        let finalEndDate = p1.endDate;
        if (p3.isActive) finalEndDate = p3.endDate;
        else if (p2.isActive) finalEndDate = p2.endDate;

        const globalStatus = finalEndDate.getTime() >= today.getTime() ? 'REGULAR' : 'VENCIDO';

        return { raw: emp, p1, p2, p3, finalEndDate, globalStatus };
    });

    // Unique Stores
    const stores = Array.from(new Set(data.map(item => item.raw.contract?.store?.name).filter(Boolean))) as string[];
    stores.sort();

    // Filter Logic
    const filtered = data.filter(item => {
        const matchesTab = activeTab === 'ALL' || item.globalStatus === activeTab;
        const searchLower = search.toLowerCase();
        const matchesSearch = item.raw.name.toLowerCase().includes(searchLower) || (item.raw.jobTitle || '').toLowerCase().includes(searchLower) || (item.raw.department || '').toLowerCase().includes(searchLower);
        const matchesStore = storeFilter === 'ALL' || item.raw.contract?.store?.name === storeFilter;
        return matchesTab && matchesSearch && matchesStore;
    });

    // Sorting: Expirations closer to today show first
    filtered.sort((a, b) => {
        const aDiff = a.finalEndDate.getTime() - today.getTime();
        const bDiff = b.finalEndDate.getTime() - today.getTime();
        return aDiff - bDiff;
    });

    const getPeriodBadge = (p: PeriodInfo, label: string) => {
        if (!p.isActive) return (
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-surface-hover/50 border border-border/50 border-dashed opacity-50 h-full">
                <span className="text-[9px] font-black uppercase text-text-muted">{label}</span>
                <span className="text-xs font-bold text-text-muted/50 mt-1">Inativo</span>
            </div>
        );

        let colors = '';
        if (p.state === 'EXPIRED') colors = 'bg-rose-500/10 border-rose-500/20 text-rose-400';
        else if (p.state === 'ACTIVE') {
            if (p.daysRemaining <= 15) colors = 'bg-amber-500/10 border-amber-500/20 text-amber-400 font-bold';
            else colors = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
        } else {
            colors = 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400/70'; // Pending
        }

        return (
            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${colors} h-full relative overflow-hidden group transition-colors`}>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1 z-10">{label} ({p.duration}d)</span>
                <span className="text-sm font-black tracking-tight leading-none z-10 font-mono">
                    {formatSafeDate(p.endDate)}
                </span>
                <div className="mt-2 text-[10px] font-bold z-10">
                    {p.state === 'EXPIRED' ? (
                        <span>Venceu há {-p.daysRemaining}d</span>
                    ) : p.state === 'ACTIVE' ? (
                        <span>{p.daysRemaining} dias restantes</span>
                    ) : (
                        <span>Inicia em {formatSafeDate(p.startDate)}</span>
                    )}
                </div>
                {p.state === 'ACTIVE' && p.daysRemaining <= 15 && (
                    <div className="absolute top-1 right-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Tabs & Export Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
                    <div className="flex bg-surface-secondary border border-border rounded-2xl p-1 shrink-0 overflow-x-auto custom-scrollbar w-full sm:w-auto">
                        {(['REGULAR', 'VENCIDO', 'ALL'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 sm:flex-none text-center ${activeTab === tab ? (tab === 'REGULAR' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : tab === 'VENCIDO' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20') : 'text-text-muted hover:text-text-primary hover:bg-surface'}`}
                            >
                                {tab === 'ALL' ? 'Todos os Registros' : tab === 'REGULAR' ? 'Contratos Regulares' : 'Contratos Vencidos'}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => {
                                const exportData = filtered.map(item => ({
                                    Nome: item.raw.name,
                                    Loja: item.raw.contract?.store?.name || 'Geral',
                                    Cargo: item.raw.jobTitle || '-',
                                    Setor: item.raw.department || '-',
                                    Admissao: formatSafeDate(item.raw.contract?.admissionDate),
                                    StatusGlobal: item.globalStatus,
                                    FimOficial: formatSafeDate(item.finalEndDate),
                                    DiasP1: item.p1.duration,
                                    DiasP2: item.p2.duration,
                                    DiasP3: item.p3.duration,
                                    TerminaEm: formatSafeDate(item.finalEndDate),
                                }));
                                exportToExcel(exportData, `Controle_Experiencia_${new Date().toISOString().split('T')[0]}`, 'Experiência');
                            }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <FileSpreadsheet className="w-4 h-4" />
                            Excel
                        </button>
                        <button
                            onClick={() => {
                                const getPeriodText = (p: PeriodInfo) => {
                                    if (!p.isActive) return '-';
                                    return `${p.daysRemaining > 0 ? 'Faltam ' + p.daysRemaining + 'd' : 'Vencido'} (${formatSafeDate(p.endDate)})`;
                                };

                                const exportData = filtered.map(item => ({
                                    Nome: item.raw.name,
                                    Loja: item.raw.contract?.store?.name || 'Geral',
                                    Per1: getPeriodText(item.p1),
                                    Per2: getPeriodText(item.p2),
                                    Per3: getPeriodText(item.p3)
                                }));
                                const cols: any = [
                                    { header: 'Nome', dataKey: 'Nome' },
                                    { header: 'Loja', dataKey: 'Loja' },
                                    { header: '1º Período', dataKey: 'Per1' },
                                    { header: '2º Período', dataKey: 'Per2' },
                                    { header: '3º Período', dataKey: 'Per3' },
                                ];
                                exportToPDF(exportData, cols, 'Controle de Experiência', `Controle_Experiencia_${new Date().toISOString().split('T')[0]}`);
                            }}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest"
                        >
                            <FileText className="w-4 h-4" />
                            PDF
                        </button>
                    </div>
                </div>

                {/* Search & Store Filter */}
                <div className="flex flex-col sm:flex-row gap-4 w-full lg:max-w-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                        <input
                            type="text"
                            placeholder="Buscar nome, cargo..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-surface-secondary border border-border rounded-2xl text-text-primary text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    {stores.length > 0 && (
                        <div className="relative shrink-0 sm:w-48">
                            <select
                                value={storeFilter}
                                onChange={e => setStoreFilter(e.target.value)}
                                className="w-full pl-4 pr-10 py-3 bg-surface-secondary border border-border rounded-2xl text-text-primary text-sm focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer"
                            >
                                <option value="ALL">Todas Lojas</option>
                                {stores.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* List */}
            <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                    {filtered.map(item => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            key={item.raw.id}
                            className="bg-surface-secondary border border-border rounded-[2rem] p-6 lg:p-8 flex flex-col xl:flex-row gap-8 items-start xl:items-center shadow-lg hover:border-indigo-500/30 transition-colors group"
                        >
                            {/* User Info */}
                            <div className="flex items-center gap-5 shrink-0 xl:w-72">
                                <div className="h-14 w-14 border border-border rounded-full overflow-hidden bg-slate-800 flex items-center justify-center relative shrink-0">
                                    {item.raw.photoUrl ? (
                                        <img src={item.raw.photoUrl} alt={item.raw.name} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <span className="text-sm font-bold text-slate-300 tracking-widest">
                                            {item.raw.name.substring(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-black text-text-primary truncate">{item.raw.name}</h3>
                                    <p className="text-[10px] font-black text-indigo-400 mt-1 uppercase tracking-widest truncate">{item.raw.contract?.store?.name || 'Geral'}</p>
                                    <p className="text-xs font-bold text-text-muted mt-0.5 truncate">{item.raw.jobTitle} • {item.raw.department}</p>
                                    <div className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${item.globalStatus === 'REGULAR' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                        {item.globalStatus === 'REGULAR' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                        {item.globalStatus === 'REGULAR' ? 'Vigente' : 'Terminado'}
                                    </div>
                                </div>
                            </div>

                            {/* Periods Track */}
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                {getPeriodBadge(item.p1, 'Ciclo Primário')}
                                {getPeriodBadge(item.p2, '1ª Prorrogação')}
                                {getPeriodBadge(item.p3, '2ª Prorrogação')}
                            </div>
                        </motion.div>
                    ))}
                    {filtered.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-surface-secondary border border-border border-dashed rounded-[2rem]"
                        >
                            <Clock className="w-12 h-12 mx-auto text-text-muted opacity-20 mb-4" />
                            <h3 className="text-sm font-black text-text-muted uppercase tracking-widest">Nenhum resultado encontrado.</h3>
                            <p className="text-[10px] text-text-muted/60 uppercase tracking-widest mt-2">Ajuste seus filtros ou recarregue a página.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
