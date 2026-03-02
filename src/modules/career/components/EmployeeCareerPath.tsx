'use client';

import { Card } from '@/shared/components/ui/card';
import { differenceInMonths } from 'date-fns';

interface Requirement {
    id: string;
    type: string;
    description: string;
    value: string | null;
}

interface Level {
    id: string;
    order: number;
    minMonths: number;
    minScore: number | null;
    jobRole: { name: string };
    requirements: Requirement[];
}

interface Props {
    careerData: {
        hasCareerPath: boolean;
        employee?: {
            name: string;
            hireDate?: Date;
            monthsInCompany?: number;
        };
        path?: {
            id: string;
            name: string;
            description: string | null;
        };
        levels?: Level[];
        currentLevelId?: string;
        currentJobRole?: string;
        nextLevel?: Level;
    };
}

const REQ_ICONS: Record<string, string> = {
    'TIME': '⏱️',
    'TRAINING': '📚',
    'EVALUATION': '📊',
    'CERTIFICATION': '📜',
    'OTHER': '📌'
};

export function EmployeeCareerPath({ careerData }: Props) {
    if (!careerData.hasCareerPath || !careerData.levels || !careerData.path) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <span className="text-5xl mb-4">🌳</span>
                <h3 className="text-xl font-bold text-slate-800">Plano de Carreira</h3>
                <p className="text-slate-500 mt-2 max-w-sm">
                    Ainda não há uma trilha de carreira configurada para o seu cargo atual ({careerData.currentJobRole || 'nenhum'}).
                </p>
                <p className="text-slate-400 text-sm mt-4">
                    Fale com o RH para saber mais sobre as oportunidades de crescimento.
                </p>
            </div>
        );
    }

    const { levels, currentLevelId, path, nextLevel, employee } = careerData;
    const currentOrder = levels.find(l => l.id === currentLevelId)?.order || 0;
    const monthsInCompany = employee?.monthsInCompany || 0;

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 text-8xl opacity-10">🌳</div>
                <h2 className="text-2xl font-bold mb-1">Sua Carreira</h2>
                <p className="text-blue-100 text-sm mb-4">Trilha: {path.name}</p>

                <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/10">
                    <p className="text-xs text-blue-200 uppercase font-bold tracking-wider mb-1">Cargo Atual</p>
                    <p className="text-xl font-bold">{careerData.currentJobRole}</p>
                    {employee?.hireDate && (
                        <p className="text-xs text-blue-100 mt-2">
                            ⏱️ {monthsInCompany} meses de casa
                        </p>
                    )}
                </div>
            </div>

            {/* Next Level Goals */}
            {nextLevel && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <span>🎯</span> Próximo Passo
                    </h3>

                    <div className="mb-4">
                        <p className="font-bold text-lg text-indigo-700">{nextLevel.jobRole.name}</p>
                        <p className="text-xs text-slate-500 mt-1">Nível {nextLevel.order} na trilha</p>
                    </div>

                    <div className="space-y-3">
                        <p className="text-xs font-bold text-slate-700 uppercase">Requisitos para promoção:</p>

                        {/* Tenure Requirement */}
                        {nextLevel.minMonths > 0 && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-700">
                                        <span className="w-5 text-center">⏱️</span> Tempo no cargo
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        {monthsInCompany} / {nextLevel.minMonths} meses
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${monthsInCompany >= nextLevel.minMonths ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(100, Math.max(0, (monthsInCompany / nextLevel.minMonths) * 100))}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Performance Requirement */}
                        {nextLevel.minScore && (
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-2 text-slate-700">
                                        <span className="w-5 text-center">📊</span> Nota de Avaliação
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        Min: {nextLevel.minScore.toFixed(1)}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-500 pl-7">Aguardando ciclo de avaliação.</p>
                            </div>
                        )}

                        {/* Additional Requirements */}
                        {nextLevel.requirements.map(req => (
                            <div key={req.id} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="w-5 text-center">{REQ_ICONS[req.type] || '📌'}</span>
                                <div>
                                    <span className="font-medium">{req.description}</span>
                                    {req.value && <span className="text-indigo-600 block text-xs">Meta: {req.value}</span>}
                                </div>
                            </div>
                        ))}

                        {nextLevel.requirements.length === 0 && !nextLevel.minMonths && !nextLevel.minScore && (
                            <p className="text-xs text-slate-500 italic">Nenhum requisito específico configurado.</p>
                        )}
                    </div>
                </div>
            )}

            {!nextLevel && (
                <div className="bg-emerald-50 rounded-2xl p-6 text-center shadow-sm border border-emerald-100">
                    <span className="text-4xl mb-2 block">🌟</span>
                    <h3 className="font-bold text-emerald-800">Topo da Trilha!</h3>
                    <p className="text-sm text-emerald-600 mt-1">
                        Você alcançou o nível máximo desta trilha de carreira. Parabéns pela jornada!
                    </p>
                </div>
            )}

            {/* Visual Full Path */}
            <div className="mt-8 pt-6 border-t border-slate-200">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">Visão Geral da Trilha</h3>
                <div className="relative pl-6 space-y-6">
                    {/* Vertical Line */}
                    <div className="absolute left-[11px] top-2 bottom-4 w-0.5 bg-slate-200"></div>

                    {levels.map((level, idx) => {
                        const isPast = level.order < currentOrder;
                        const isCurrent = level.order === currentOrder;
                        const isFuture = level.order > currentOrder;

                        return (
                            <div key={level.id} className="relative">
                                {/* Node Indicator */}
                                <div className={`absolute -left-[30px] w-4 h-4 rounded-full border-2 ${isPast ? 'bg-indigo-500 border-indigo-500' :
                                    isCurrent ? 'bg-white border-indigo-500 ring-4 ring-indigo-100' :
                                        'bg-white border-slate-300'
                                    }`}>
                                    {isPast && (
                                        <svg className="w-2.5 h-2.5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`pt-0.5 ${isFuture ? 'opacity-60' : ''}`}>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nível {level.order}</span>
                                    <h4 className={`font-bold ${isCurrent ? 'text-indigo-700 text-lg' : isPast ? 'text-slate-700' : 'text-slate-500'}`}>
                                        {level.jobRole.name}
                                    </h4>
                                    {isCurrent && (
                                        <span className="inline-block px-2 py-0.5 mt-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                            Você está aqui
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
