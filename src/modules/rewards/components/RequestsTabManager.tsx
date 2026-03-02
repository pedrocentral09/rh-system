'use client';

import { useState } from 'react';
import { RedemptionManager } from './RedemptionManager';
import { MissionApprovalManager } from './MissionApprovalManager';

interface Props {
    redemptions: any[];
    missionCompletions: any[];
}

export function RequestsTabManager({ redemptions, missionCompletions }: Props) {
    const [activeTab, setActiveTab] = useState<'REDEMPTIONS' | 'MISSIONS'>('REDEMPTIONS');

    const pendingRedemptionsCount = redemptions.filter(r => r.status === 'PENDING').length;

    return (
        <div className="space-y-6">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setActiveTab('REDEMPTIONS')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'REDEMPTIONS' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    🛍️ Resgates de Loja
                    {pendingRedemptionsCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-[10px]">{pendingRedemptionsCount}</span>
                    )}
                    {activeTab === 'REDEMPTIONS' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"></div>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('MISSIONS')}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wider relative transition-colors ${activeTab === 'MISSIONS' ? 'text-amber-500 dark:text-amber-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                >
                    🎯 Aprovação de Missões
                    {missionCompletions.length > 0 && (
                        <span className="ml-2 bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px]">{missionCompletions.length}</span>
                    )}
                    {activeTab === 'MISSIONS' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 dark:bg-amber-400"></div>
                    )}
                </button>
            </div>

            <div className="pt-2">
                {activeTab === 'REDEMPTIONS' ? (
                    <RedemptionManager redemptions={redemptions} />
                ) : (
                    <MissionApprovalManager initialPending={missionCompletions} />
                )}
            </div>
        </div>
    );
}
