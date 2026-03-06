'use client';

import { useState } from 'react';
import { submitClimateSurvey } from '@/modules/performance/actions/climate';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';

export function ClimateSurveyWidget() {
    const [step, setStep] = useState<'IDLE' | 'SCORE' | 'COMMENT'>('IDLE');
    const [score, setScore] = useState<number | null>(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (score === null) return;

        setLoading(true);
        const result = await submitClimateSurvey({ score, comment });

        if (result.success) {
            toast.success('Obrigado pelo seu feedback! 🌟');
            setStep('IDLE');
            setScore(null);
            setComment('');
            // Podíamos salvar no localStorage que já respondeu essa semana para não encher o saco
            localStorage.setItem('lastClimateSurvey', new Date().toISOString());
        } else {
            toast.error('Ocorreu um erro.');
        }
        setLoading(false);
    };

    const handleScoreSelect = (selected: number) => {
        setScore(selected);
        setStep('COMMENT');
    };

    if (step === 'IDLE') {
        const lastSurvey = typeof window !== 'undefined' ? localStorage.getItem('lastClimateSurvey') : null;
        if (lastSurvey) {
            const hoursSince = (new Date().getTime() - new Date(lastSurvey).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) return null;
        }

        return (
            <Card className="bg-slate-900 border-none rounded-[32px] overflow-hidden relative shadow-xl">
                <CardContent className="p-6 relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-xl">🌡️</div>
                        <div>
                            <h3 className="font-black text-white text-sm uppercase tracking-widest">Termômetro</h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Como está seu dia?</p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-xs font-medium mb-5 leading-relaxed">
                        Sua opinião é anônima e fundamental para construirmos uma empresa melhor.
                    </p>
                    <Button
                        size="sm"
                        onClick={() => setStep('SCORE')}
                        className="w-full bg-brand-blue hover:bg-brand-blue/90 text-white rounded-2xl h-11 font-black text-xs uppercase tracking-wider"
                    >
                        Responder Agora
                    </Button>
                </CardContent>
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-brand-orange rounded-full blur-[60px] opacity-10" />
            </Card>
        );
    }

    if (step === 'SCORE') {
        return (
            <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="font-[1000] text-slate-800 text-sm text-center mb-2 uppercase tracking-tighter">Numa escala de 0 a 10...</h3>
                <p className="text-[11px] text-slate-400 text-center mb-6 font-medium px-4">
                    Quanto você recomendaria a Rede Família como um bom lugar para se trabalhar?
                </p>

                <div className="flex flex-wrap gap-1.5 justify-center max-w-sm mx-auto mb-4">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                        let colorClass = 'bg-slate-50 text-slate-400 hover:bg-slate-100';
                        if (num <= 6) colorClass = 'bg-rose-50 text-rose-500 hover:bg-rose-100 border-rose-100/50';
                        else if (num <= 8) colorClass = 'bg-amber-50 text-amber-500 hover:bg-amber-100 border-amber-100/50';
                        else colorClass = 'bg-emerald-50 text-emerald-500 hover:bg-emerald-100 border-emerald-100/50';

                        return (
                            <button
                                key={num}
                                onClick={() => handleScoreSelect(num)}
                                className={`w-8 h-10 flex items-center justify-center rounded-xl font-[1000] text-xs transition-all active:scale-90 border ${colorClass}`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between text-[8px] font-black text-slate-300 uppercase tracking-widest px-4">
                    <span>Improvável</span>
                    <span>Provável</span>
                </div>

                <div className="mt-8 text-center">
                    <button onClick={() => setStep('IDLE')} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest">
                        Pular por enquanto
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-6">
                <h3 className="font-[1000] text-slate-800 text-sm mb-1 uppercase tracking-tighter">O que motivou sua nota?</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Espaço opcional para sua voz</p>
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Seu feedback anônimo..."
                    className="w-full text-sm border border-slate-100 rounded-2xl p-4 min-h-[100px] bg-slate-50 mb-4 focus:ring-4 ring-brand-blue/5 focus:bg-white transition-all outline-none placeholder:text-slate-300"
                />

                <div className="flex gap-2">
                    <Button type="button" variant="ghost" className="flex-1 rounded-2xl text-[10px] font-black uppercase tracking-widest h-12" onClick={() => handleSubmit()} disabled={loading}>
                        Pular
                    </Button>
                    <Button type="submit" className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest shadow-lg" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
