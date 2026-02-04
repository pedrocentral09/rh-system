'use client';

import { useState } from 'react';
import { Card } from '@/shared/components/ui/card';

interface NotificationsProps {
    stats: any;
}

export function NotificationsPopover({ stats }: NotificationsProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Count alerts
    const alertsCount = (stats.probationAlerts?.length || 0) + (stats.upcomingBirthdays?.length || 0);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
            >
                <span className="text-xl">🔔</span>
                {alertsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                        {alertsCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 z-40 animate-in slide-in-from-top-2 duration-200">
                        <Card className="border-slate-200 shadow-xl overflow-hidden">
                            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                                <h3 className="font-semibold text-sm text-slate-700">Notificações</h3>
                                {alertsCount > 0 && <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{alertsCount} novas</span>}
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-0">
                                {alertsCount === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">
                                        Tudo tranquilo! Nenhuma notificação.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {/* Birthdays */}
                                        {stats.upcomingBirthdays?.map((emp: any) => (
                                            <div key={`bday-${emp.id}`} className="p-3 hover:bg-slate-50 flex items-start gap-3">
                                                <div className="text-lg">🎂</div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">Aniversário de {emp.name}</p>
                                                    <p className="text-xs text-slate-500">Dia {emp.day} deste mês</p>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Probation */}
                                        {stats.probationAlerts?.map((emp: any) => (
                                            <div key={`prob-${emp.id}`} className="p-3 hover:bg-slate-50 flex items-start gap-3">
                                                <div className="text-lg">⚠️</div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">Fim de Experiência: {emp.name}</p>
                                                    <p className="text-xs text-amber-600 font-medium">{emp.days} dias restantes ({emp.period})</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
