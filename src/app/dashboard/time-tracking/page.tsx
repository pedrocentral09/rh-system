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

export default function TimeTrackingPage() {
    const [activeTab, setActiveTab] = useState<'daily' | 'bank' | 'import' | 'reports' | 'closing'>('daily');

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Controle de Ponto</h1>
                    <p className="text-slate-500">Gestão de frequência e horas.</p>
                </div>
                <TimeTrackingSyncButton />
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Visão Diária
                </button>
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'bank' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Banco de Horas
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'import' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Importar Arquivo
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Relatórios
                </button>
                <button
                    onClick={() => setActiveTab('closing')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'closing' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Fechamento
                </button>
            </div>

            {/* Tab Content */}
            <div className="animate-in fade-in duration-300">
                {activeTab === 'daily' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-700">Espelho Diário</h2>
                        <DailyOverview />
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-slate-700">Saldo de Horas (Mensal)</h2>
                        <BankOfHours />
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Upload Section */}
                        <div className="md:col-span-1">
                            <AFDUploadForm />
                        </div>

                        {/* Recent Files List */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Arquivos Importados</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <TimeFileList />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <TimeTrackingReportsTab />
                )}

                {activeTab === 'closing' && (
                    <TimeTrackingClosingTab />
                )}
            </div>
        </div>
    );
}
