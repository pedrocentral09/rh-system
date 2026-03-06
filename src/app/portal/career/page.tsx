'use client';

import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/lib/utils';
import {
    TreeDeciduous as Career,
    TrendingUp,
    Award,
    BookOpen,
    Target,
    ChevronRight,
    Star,
    Zap
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

export default function PortalCareerPage() {
    return (
        <div className="space-y-6 pb-20">
            {/* Header / Premium Career Card */}
            <Card className="bg-slate-900 border-none rounded-[32px] overflow-hidden relative shadow-2xl shadow-slate-200">
                <CardContent className="p-8 text-white relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl">
                            <TrendingUp className="h-6 w-6 text-brand-orange" />
                        </div>
                        <Badge className="bg-brand-blue/30 text-brand-blue border-none font-black text-[9px] uppercase tracking-widest px-3 py-1">Nível 2</Badge>
                    </div>

                    <div className="space-y-1">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Posição Atual</p>
                        <h3 className="text-3xl font-[1000] tracking-tight mb-6">
                            Vendedor <span className="text-brand-blue">Trainee</span>
                        </h3>

                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 w-8 rounded-full border-2 border-slate-900 bg-brand-blue flex items-center justify-center shadow-lg">
                                        <Star className="h-4 w-4 fill-white text-white" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rumo ao nível Júnior</span>
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
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Engajamento</p>
                        <h4 className="text-2xl font-[1000] text-slate-800">85%</h4>
                    </div>
                    <div className="ml-auto">
                        <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-tighter text-brand-blue bg-brand-blue/5">Detalhes</Button>
                    </div>
                </div>

                <div className="bg-white border border-slate-50 rounded-[28px] p-6 shadow-sm flex items-center gap-5">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <Award className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Conquistas</p>
                        <h4 className="text-2xl font-[1000] text-slate-800">12</h4>
                    </div>
                    <div className="ml-auto">
                        <Button variant="ghost" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-tighter text-brand-blue bg-brand-blue/5">Ver Tudo</Button>
                    </div>
                </div>
            </div>

            {/* Roadmap */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">Minha Trilha</h3>
                </div>

                <div className="space-y-3">
                    {[
                        { title: 'Treinamento de Integração', status: 'Concluído', icon: CheckCircle2Icon },
                        { title: 'Manual de Vendas 2026', status: 'Concluído', icon: BookOpen },
                        { title: 'Excel Avançado para Varejo', status: 'Em Curso', icon: TrendingUp },
                        { title: 'Certificação em Liderança', status: 'Bloqueado', icon: LockIcon },
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white border border-slate-50 rounded-[28px] p-4 flex items-center justify-between shadow-sm active:scale-95 transition-all cursor-pointer">
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-14 w-14 rounded-[20px] flex items-center justify-center transition-colors",
                                    item.status === 'Concluído' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-400'
                                )}>
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-[900] text-slate-900 leading-none mb-1.5 uppercase text-xs tracking-tight">{item.title}</h4>
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn(
                                            "text-[8px] font-black uppercase pt-0.5 pb-1 px-2 h-auto rounded-lg tracking-tighter border-none",
                                            item.status === 'Concluído' ? 'bg-emerald-500/10 text-emerald-600' : (item.status === 'Em Curso' ? 'bg-brand-blue/10 text-brand-blue' : 'bg-slate-100 text-slate-400')
                                        )}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-200" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Info Section */}
            <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-brand-blue/5 rounded-xl text-brand-blue">
                        <Target className="h-4 w-4" />
                    </div>
                    <h4 className="font-black text-xs uppercase tracking-widest text-slate-800">Próximo Desafio</h4>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-relaxed">
                    Você está a <b>15 dias</b> e <b>2 treinamentos</b> de atingir os critérios para a promoção de Vendedor Júnior. Mantenha o foco nos resultados!
                </p>
            </div>
        </div>
    );
}

function CheckCircle2Icon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}

function LockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
