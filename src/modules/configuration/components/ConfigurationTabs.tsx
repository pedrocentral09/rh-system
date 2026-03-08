'use client';

import { useState } from 'react';
import { CompanyProfileForm } from './CompanyProfileForm';
import { UserList } from './UserList';
import { ProfileList } from './ProfileList';
import { AuditLogViewer } from './AuditLogViewer';
import { CompanyList } from './CompanyList';
import { StoreList } from './StoreList';
import { AuxiliaryTablesManager } from './AuxiliaryTablesManager';
import { HolidayManager } from './HolidayManager';
import { Card, CardContent } from '@/shared/components/ui/card';

export function ConfigurationTabs() {
    const [activeTab, setActiveTab] = useState<'company' | 'users' | 'tables' | 'audit' | 'holidays'>('company');

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Premium Tabs Navigation */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-surface/60 backdrop-blur-xl border border-border rounded-[1.5rem] w-fit">
                {[
                    { id: 'company', label: 'Empresa & Unidades', icon: '🏢' },
                    { id: 'users', label: 'Contas & Segurança', icon: '👥' },
                    { id: 'tables', label: 'Cargos & Setores', icon: '📚' },
                    { id: 'audit', label: 'Rastro Digital', icon: '🛡️' },
                    { id: 'holidays', label: 'Calendário Oficial', icon: '📅' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 group ${activeTab === tab.id
                            ? 'bg-brand-orange text-white shadow-[0_0_25px_rgba(255,102,0,0.3)]'
                            : 'text-text-muted hover:text-text-primary hover:bg-text-primary/[0.03]'
                            }`}
                    >
                        <span className="text-sm scale-110 group-hover:scale-125 transition-transform">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="relative min-h-[400px]">
                {activeTab === 'company' && (
                    <div className="space-y-10">
                        <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl flex items-center gap-3">
                            <span className="text-lg">ℹ️</span>
                            Parametrização global: Estes dados regem a emissão de contratos e documentos legais do sistema.
                        </div>
                        <CompanyProfileForm />
                        <div className="pt-12 border-t border-border">
                            <div className="mb-8">
                                <h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">Matriz <span className="text-brand-orange">Organizacional</span></h3>
                                <p className="text-text-muted text-[10px] font-bold uppercase tracking-widest mt-1">Gestão Multinível de Sociedades e Unidades de Negócio</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <CompanyList />
                                <StoreList />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-12">
                        <UserList />
                        <div className="border-t border-border pt-12">
                            <ProfileList />
                        </div>
                    </div>
                )}

                {activeTab === 'tables' && (
                    <AuxiliaryTablesManager />
                )}

                {activeTab === 'audit' && (
                    <AuditLogViewer />
                )}

                {activeTab === 'holidays' && (
                    <HolidayManager />
                )}
            </div>
        </div>
    );
}
