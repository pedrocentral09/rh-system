'use client';

import { useState } from 'react';
import { EmployeeList } from '@/modules/personnel/components/EmployeeList';
import { EmployeeCreateModal } from '@/modules/personnel/components/EmployeeCreateModal';
import { EmployeeImportModal } from '@/modules/personnel/components/EmployeeImportModal';
import { MinimumWageUpdateButton } from '@/modules/personnel/components/MinimumWageUpdateButton';
import { EmployeeOnboardingRequestModal } from '@/modules/personnel/components/EmployeeOnboardingRequestModal';
import { motion } from 'framer-motion';
import { Users, UserPlus, FileUp, Link as LinkIcon, Sparkles } from 'lucide-react';

export default function PersonnelPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div className="space-y-12 max-w-[1600px] mx-auto pb-20 animate-in fade-in duration-700">
            {/* Premium Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-[#0A0F1C]/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full -ml-48 -mt-48 pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shadow-2xl">
                        <Users className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">Governança de <span className="text-indigo-400">Capital Humano</span></h1>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic text-center md:text-left">Arquitetura de Talentos & Conformidade Organizacional</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 relative z-10">
                    <MinimumWageUpdateButton />

                    <button
                        onClick={() => setIsOnboardingModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:text-white hover:bg-indigo-500/20 transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                    >
                        <LinkIcon className="h-4 w-4" /> LINK AUTOCADASTRO
                    </button>

                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 active:scale-95 shadow-xl"
                    >
                        <FileUp className="h-4 w-4" /> IMPORTAR LOTE
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="h-14 px-10 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.05)] active:scale-95"
                    >
                        <UserPlus className="h-4 w-4" /> NOVO COLABORADOR
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative">
                <EmployeeList refreshTrigger={refreshTrigger} />
            </div>

            {/* Modals */}
            <EmployeeCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    handleRefresh();
                }}
            />

            <EmployeeImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={() => {
                    setIsImportModalOpen(false);
                    handleRefresh();
                }}
            />

            <EmployeeOnboardingRequestModal
                isOpen={isOnboardingModalOpen}
                onClose={() => setIsOnboardingModalOpen(false)}
                onSuccess={() => {
                    handleRefresh();
                }}
            />
        </div>
    );
}
