'use client';

import { useState } from 'react';
import { EmployeeList } from '@/modules/personnel/components/EmployeeList';
import { EmployeeCreateModal } from '@/modules/personnel/components/EmployeeCreateModal';
import { Button } from '@/shared/components/ui/button';

export default function PersonnelPage() {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Gestão de Pessoal</h1>
                    <p className="text-slate-500 mt-1">Gerencie todos os colaboradores ativos e o histórico da empresa.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-brand-orange hover:bg-orange-600 text-white font-bold py-2 px-4 rounded shadow-lg transform transition hover:-translate-y-0.5"
                >
                    + Novo Funcionário
                </Button>
            </div>

            {/* Main List View */}
            <EmployeeList key={isCreateModalOpen ? 'validating' : 'list'} />

            {/* Modals */}
            <EmployeeCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    setIsCreateModalOpen(false);
                    // Simple way to refresh list: trigger re-render or reload
                    window.location.reload();
                }}
            />
        </div>
    );
}
