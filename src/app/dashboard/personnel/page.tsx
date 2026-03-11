'use client';

import { useState } from 'react';
import { EmployeeList } from '@/modules/personnel/components/EmployeeList';
import { EmployeeCreateModal } from '@/modules/personnel/components/EmployeeCreateModal';
import { MinimumWageUpdateButton } from '@/modules/personnel/components/MinimumWageUpdateButton';
import { EmployeeOnboardingRequestModal } from '@/modules/personnel/components/EmployeeOnboardingRequestModal';
import { motion } from 'framer-motion';
import { Users, UserPlus, Link as LinkIcon, Sparkles } from 'lucide-react';

export default function PersonnelPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div className="space-y-6 lg:space-y-12 max-w-[1600px] mx-auto pb-10 lg:pb-20 animate-in fade-in duration-700">
            {/* Premium Page Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-surface p-6 lg:p-10 rounded-3xl lg:rounded-[3rem] border border-border shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-blue/[0.03] blur-[120px] rounded-full pointer-events-none" />

                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-[2rem] bg-brand-blue/5 border border-brand-blue/10 dark:bg-brand-blue/20 flex items-center justify-center shadow-lg transition-transform hover:scale-110 font-bold">
                        <Users className="h-8 w-8 text-brand-blue dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl lg:text-4xl font-black text-text-primary uppercase tracking-tighter leading-tight mb-2">Governança de <span className="text-brand-blue dark:text-blue-400">Capital Humano</span></h1>
                        <p className="text-[10px] lg:text-[11px] font-black text-text-muted uppercase tracking-[0.2em] lg:tracking-[0.4em] italic text-left">Arquitetura de Talentos & Conformidade Organizacional</p>
                    </div>
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



            <EmployeeOnboardingRequestModal
                isOpen={isOnboardingModalOpen}
                onClose={() => setIsOnboardingModalOpen(false)}
                onSuccess={() => {
                    handleRefresh();
                }}
            />
        </div >
    );
}
