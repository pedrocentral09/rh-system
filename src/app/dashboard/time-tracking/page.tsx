'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { AFDUploadForm } from '@/modules/time-tracking/components/AFDUploadForm';
import { TimeFileList } from '@/modules/time-tracking/components/TimeFileList';
import { DailyOverview } from '@/modules/time-tracking/components/DailyOverview';
import { BankOfHours } from '@/modules/time-tracking/components/BankOfHours';
import { Button } from '@/shared/components/ui/button';

import { TimeTrackingSyncButton } from '@/modules/time-tracking/components/TimeTrackingSyncButton';
import { TimeTrackingReportsTab } from '@/modules/time-tracking/components/TimeTrackingReportsTab';
import { TimeTrackingClosingTab } from '@/modules/time-tracking/components/TimeTrackingClosingTab';
import { OrphanPunchesTab } from '@/modules/time-tracking/components/OrphanPunchesTab';

import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Database, UploadCloud, ShieldAlert, FileSearch, Lock, Timer } from 'lucide-react';

export default function TimeTrackingPage() {
    const [activeTab, setActiveTab] = useState<'daily' | 'bank' | 'import' | 'reports' | 'closing' | 'orphans'>('daily');

    const tabs = [
        { id: 'daily', label: 'Monitoramento Diário', icon: Calendar },
        { id: 'bank', label: 'Custódia de Horas', icon: Database },
        { id: 'import', label: 'Ingestão AFD', icon: UploadCloud },
        { id: 'orphans', label: 'Vácuo Identitário', icon: ShieldAlert, pulse: true },
        { id: 'reports', label: 'Auditória Especial', icon: FileSearch },
        { id: 'closing', label: 'Fechamento Estratégico', icon: Lock },
    ];

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Premium Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-[#0A0F1C]/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center shadow-2xl">
                        <Timer className="h-8 w-8 text-brand-orange" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Central de <span className="text-brand-orange">Cronometria</span></h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Governança Temporal & Conformidade Operacional</p>
                    </div>
                </div>

                <div className="relative z-10">
                    <TimeTrackingSyncButton />
                </div>
            </div>

            {/* Premium Navigation */}
            <div className="flex bg-[#0A0F1C]/40 backdrop-blur-md p-2 rounded-[2rem] border border-white/5 w-full overflow-x-auto no-scrollbar shadow-xl">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap relative group ${isActive
                                    ? 'bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.1)]'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-brand-orange' : 'text-slate-600 group-hover:text-brand-orange/60'}`} />
                            {tab.label}
                            {tab.pulse && !isActive && (
                                <span className="ml-2 w-2 h-2 rounded-full bg-brand-orange animate-pulse shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                            )}
                            {isActive && (
                                <motion.div
                                    layoutId="activeGlow"
                                    className="absolute inset-0 bg-brand-orange/5 blur-xl rounded-full -z-10"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Dynamic Viewport */}
            <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="min-h-[600px]"
            >
                {activeTab === 'daily' && <DailyOverview />}
                {activeTab === 'bank' && <BankOfHours />}
                {activeTab === 'import' && (
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                        <div className="xl:col-span-4 self-start">
                            <AFDUploadForm />
                        </div>
                        <div className="xl:col-span-8">
                            <div className="bg-[#0A0F1C]/60 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                                <TimeFileList />
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'orphans' && <OrphanPunchesTab />}
                {activeTab === 'reports' && <TimeTrackingReportsTab />}
                {activeTab === 'closing' && <TimeTrackingClosingTab />}
            </motion.div>
        </div>
    );
}
