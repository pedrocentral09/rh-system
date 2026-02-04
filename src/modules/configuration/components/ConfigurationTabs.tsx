'use client';

import { useState } from 'react';
import { CompanyProfileForm } from './CompanyProfileForm';
import { UserList } from './UserList';
import { ProfileList } from './ProfileList';
import { AuditLogViewer } from './AuditLogViewer';
import { CompanyList } from './CompanyList';
import { StoreList } from './StoreList';
import { Card, CardContent } from '@/shared/components/ui/card';

export function ConfigurationTabs() {
    const [activeTab, setActiveTab] = useState<'company' | 'users' | 'tables' | 'audit'>('company');

    return (
        <div className="space-y-6">
            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('company')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'company'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    🏢 Empresa
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    👥 Usuários
                </button>
                <button
                    onClick={() => setActiveTab('tables')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'tables'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    📚 Tabelas Auxiliares
                </button>
                <button
                    onClick={() => setActiveTab('audit')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'audit'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                >
                    🛡️ Auditoria
                </button>
            </div>

            {/* Content Area */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'company' && (
                    <div className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-sm p-4 rounded-md border border-blue-100 dark:border-blue-900">
                            ℹ️ Estes dados serão utilizados em cabeçalhos de relatórios e documentos oficiais.
                        </div>
                        <CompanyProfileForm />
                        <div className="pt-8 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Estrutura Organizacional (Multi-Empresa)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CompanyList />
                                <StoreList />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-8">
                        <UserList />
                        <div className="border-t border-slate-200 pt-8">
                            <ProfileList />
                        </div>
                    </div>
                )}

                {activeTab === 'tables' && (
                    <Card className="border-slate-200 bg-slate-50/50">
                        <CardContent className="py-12 text-center text-slate-500">
                            <span className="text-4xl block mb-2">🚧</span>
                            <h3 className="text-lg font-medium text-slate-700">Em Desenvolvimento</h3>
                            <p className="max-w-md mx-auto mt-2 text-sm">
                                Aqui você poderá gerenciar tabelas auxiliares como:
                                <br />Cargos, Departamentos, Sindicatos e Motivos de Desligamento.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {activeTab === 'audit' && (
                    <AuditLogViewer />
                )}
            </div>
        </div>
    );
}
