'use client';

import { useState } from 'react';
import { EmployeeList } from '@/modules/personnel/components/EmployeeList';
import { EmployeeCreateModal } from '@/modules/personnel/components/EmployeeCreateModal';
import { EmployeeImportModal } from '@/modules/personnel/components/EmployeeImportModal';
import { MinimumWageUpdateButton } from '@/modules/personnel/components/MinimumWageUpdateButton';
import { Button } from '@/shared/components/ui/button';
import { Tabs } from '@/shared/components/ui/tabs';
import { Link as LinkIcon } from 'lucide-react';
import { EmployeeOnboardingRequestModal } from '@/modules/personnel/components/EmployeeOnboardingRequestModal';

export default function PersonnelPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleRefresh = () => setRefreshTrigger(prev => prev + 1);

    return (
        <div className="space-y-8 max-w-full">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestão de Pessoal</h1>
                    <p className="text-slate-500 mt-1">Gerencie todos os colaboradores ativos e o histórico da empresa.</p>
                </div>
                <div className="flex items-center gap-3">
                    <MinimumWageUpdateButton />
                    <Button
                        variant="outline"
                        onClick={() => setIsOnboardingModalOpen(true)}
                        className="gap-2 font-semibold border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                        <LinkIcon className="h-4 w-4" />
                        Autocadastro (Link)
                    </Button>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg transform transition hover:-translate-y-0.5"
                    >
                        + Novo Funcionário
                    </Button>
                </div>
            </div>

            {/* Main List View */}
            <Tabs
                defaultValue="list"
                fullContent={true}
                tabs={[
                    {
                        id: 'list',
                        label: 'Colaboradores',
                        content: <EmployeeList refreshTrigger={refreshTrigger} />
                    }
                ]}
            />

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
