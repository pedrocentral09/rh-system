'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import {
    TrendingUp,
    Award,
    BookOpen,
    Target,
    ChevronRight,
    Star,
    Zap,
    Lock
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface CareerPathClientProps {
    careerData: any;
}

export default function CareerPathClient({ careerData }: CareerPathClientProps) {
    if (!careerData || !careerData.hasCareerPath) {
        return (
            <div className="space-y-6 pb-20">
                <Card className="bg-slate-900 border-none rounded-[32px] overflow-hidden relative shadow-2xl">
                    <CardContent className="p-8 text-white relative z-10 text-center">
                        <div className="p-4 bg-white/10 rounded-2xl w-fit mx-auto mb-4">
                            <TrendingUp className="h-8 w-8 text-brand-orange" />
                        </div>
                        <h3 className="text-2xl font-[1000] tracking-tight mb-2">Trilha de Carreira</h3>
                        <p className="text-slate-400 text-sm max-w-xs mx-auto">
                            Você ainda não possui uma trilha definida para o seu cargo atual ({careerData?.currentRole || 'Colaborador'}).
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { levels, currentLevelId, nextLevel, employee, progressionReport } = careerData;
    const currentLevelData = levels.find((l: any) => l.id === currentLevelId);

    // Calculate engagement (real based on totalProgress)
    const engagement = progressionReport?.totalProgress || 0;
    const totalAchieved = progressionReport?.allPassed ? levels.filter((l: any) => l.order <= currentLevelData?.order).length : levels.filter((l: any) => l.order < currentLevelData?.order).length;

    return (
        <div className="space-y-6 pb-20">
            {/* Header / Premium Career Card */}
            <Card className="bg-slate-900 border-none rounded-[32px] overflow-hidden relative shadow-2xl shadow-slate-200">
                <CardContent className="p-8 text-white relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                            <TrendingUp className="h-6 w-6 text-brand-orange" />
                        </div>
                        <Badge className="bg-brand-blue/30 text-brand-blue border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">
                            Nível {currentLevelData?.order || 1}
                        </Badge>
                    </div>

                    <div className="space-y-1">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Posição Atual</p>
                        <h3 className="text-3xl font-[1000] tracking-tight mb-6 uppercase italic">
                            {currentLevelData?.jobRole?.name || 'Colaborador'}
                        </h3>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                                {Array.from({ length: currentLevelData?.order || 1 }).map((_, i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-brand-blue flex items-center justify-center shadow-lg">
                                        <Star className="h-4 w-4 fill-white text-white" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                {nextLevel ? `Rumo ao nível ${nextLevel.jobRole.name}` : 'Nível máximo atingido!'}
                            </span>
                        </div>
                    </div>
                </CardContent>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-brand-blue rounded-full blur-[100px] opacity-20" />
            </Card>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-orange-50 flex items-center justify-center text-brand-orange">
                        <Zap className="h-7 w-7 fill-brand-orange/20" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status de Evolução</p>
                        <h4 className="text-2xl font-[1000] text-slate-800">{engagement}%</h4>
                    </div>
                    <div className="ml-auto">
                        <Badge className={cn(
                            "rounded-lg text-[8px] font-black uppercase",
                            engagement >= 100 ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600"
                        )}>
                            {engagement >= 100 ? 'Pronto' : 'Em Progresso'}
                        </Badge>
                    </div>
                </div>

                <div className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Award className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Etapas Superadas</p>
                        <h4 className="text-2xl font-[1000] text-slate-800">{currentLevelData?.order || 0}</h4>
                    </div>
                    <div className="ml-auto">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">De {levels.length} níveis</p>
                    </div>
                </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Minha Trilha</h3>
                </div>

                <div className="space-y-3">
                    {levels.map((level: any, idx: number) => {
                        const isCompleted = level.order <= currentLevelData.order;
                        const isCurrent = level.id === currentLevelId;
                        const isLocked = level.order > currentLevelData.order + 1;

                        return (
                            <div key={level.id} className={cn(
                                "bg-white border border-slate-50 rounded-[28px] p-4 flex items-center justify-between shadow-sm transition-all",
                                !isLocked ? "active:scale-95 cursor-pointer" : "opacity-60 cursor-not-allowed"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-14 w-14 rounded-[20px] flex items-center justify-center transition-colors",
                                        isCompleted ? 'bg-emerald-50 text-emerald-500' : (isLocked ? 'bg-slate-50 text-slate-300' : 'bg-brand-blue/10 text-brand-blue')
                                    )}>
                                        {isLocked ? <Lock className="h-6 w-6" /> : (isCompleted ? <Award className="h-6 w-6" /> : <Target className="h-6 w-6" />)}
                                    </div>
                                    <div>
                                        <h4 className="font-[900] text-slate-900 leading-none mb-1.5 uppercase text-xs tracking-tight">{level.jobRole.name}</h4>
                                        <div className="flex items-center gap-3">
                                            <Badge className={cn(
                                                "text-[8px] font-black uppercase pt-0.5 pb-1 px-2 h-auto rounded-lg tracking-tighter border-none",
                                                isCurrent ? 'bg-brand-orange/10 text-brand-orange' : (isCompleted ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-400')
                                            )}>
                                                {isCurrent ? 'Nível Atual' : (isCompleted ? 'Concluído' : 'Próximo Passo')}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-200" />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Info Section */}
            {nextLevel && (
                <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-brand-blue/5 rounded-xl text-brand-blue">
                            <Target className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">Próximo Desafio</h4>
                    </div>
                    <div className="text-slate-400 text-xs font-medium leading-relaxed space-y-2">
                        <p>
                            Você está no cargo de <b>{currentLevelData.jobRole.name}</b> há <b>{careerData.employee.monthsInCompany} meses</b>.
                            {nextLevel.minMonths > 0 && careerData.employee.monthsInCompany < nextLevel.minMonths && (
                                <span> Faltam {(nextLevel.minMonths - careerData.employee.monthsInCompany)} meses de maturidade para o próximo nível.</span>
                            )}
                        </p>

                        {!progressionReport?.allPassed && (
                            <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 text-rose-600 mt-2">
                                <p className="font-black uppercase tracking-tighter text-[9px] mb-2">Requisitos Pendentes:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {!progressionReport?.report?.score?.passed && (
                                        <li>Média de desempenho atual (<b>{progressionReport?.report?.score?.current.toFixed(1)}</b>) abaixo do necessário (<b>{progressionReport?.report?.score?.limit}</b>)</li>
                                    )}
                                    {!progressionReport?.report?.warnings?.passed && (
                                        <li>Limite de advertências excedido (<b>{progressionReport?.report?.warnings?.current}/{progressionReport?.report?.warnings?.limit}</b>)</li>
                                    )}
                                    {!progressionReport?.report?.absences?.passed && (
                                        <li>Excesso de suspensões/faltas grave (<b>{progressionReport?.report?.absences?.current}/{progressionReport?.report?.absences?.limit}</b>)</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <p className="pt-2 text-[11px]">
                            {nextLevel.mission || `Atingindo as metas, seu próximo cargo será: ${nextLevel.jobRole.name}.`}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
