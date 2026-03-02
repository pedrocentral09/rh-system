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
            // Se respondeu nas últimas 24h, oculta. (Num cenário real, seria por semana/mês)
            const hoursSince = (new Date().getTime() - new Date(lastSurvey).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) return null;
        }

        return (
            <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-10 -mr-10 -mt-10"></div>
                <CardContent className="p-4 flex flex-col justify-between items-center text-center">
                    <span className="text-3xl mb-2">🌡️</span>
                    <h3 className="font-bold text-slate-800 text-sm">Termômetro de Clima</h3>
                    <p className="text-xs text-slate-500 mt-1 mb-3">
                        Conta pra gente: como está sendo trabalhar aqui ultimamente? É anônimo e rapidinho!
                    </p>
                    <Button size="sm" onClick={() => setStep('SCORE')} className="w-full bg-indigo-600 hover:bg-indigo-700">Responder (1 min)</Button>
                </CardContent>
            </Card>
        );
    }

    if (step === 'SCORE') {
        return (
            <div className="bg-white rounded-xl p-5 shadow-lg border border-indigo-200 animate-in fade-in slide-in-from-bottom-2">
                <h3 className="font-bold text-slate-800 text-sm text-center mb-1">Numa escala de 0 a 10...</h3>
                <p className="text-xs text-slate-500 text-center mb-4 leading-relaxed">
                    Quanto você recomendaria a Família Supermercados como um bom lugar para se trabalhar?
                </p>

                <div className="flex flex-wrap gap-1 justify-center max-w-sm mx-auto">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                        // Colors based on NPS: 0-6 Detractors (Red), 7-8 Passives (Yellow), 9-10 Promoters (Green)
                        let colorClass = 'bg-slate-100 text-slate-700 hover:bg-slate-200';
                        if (num <= 6) colorClass = 'bg-red-50 text-red-600 hover:bg-red-100 border-red-100';
                        else if (num <= 8) colorClass = 'bg-amber-50 text-amber-600 hover:bg-amber-100 border-amber-100';
                        else colorClass = 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-emerald-100';

                        return (
                            <button
                                key={num}
                                onClick={() => handleScoreSelect(num)}
                                className={`w-[28px] h-[36px] flex items-center justify-center rounded-md font-bold text-sm transition-transform active:scale-95 border ${colorClass}`}
                            >
                                {num}
                            </button>
                        );
                    })}
                </div>

                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-2">
                    <span>Muito improvável</span>
                    <span>Muito provável</span>
                </div>

                <div className="mt-4 text-center">
                    <button onClick={() => setStep('IDLE')} className="text-xs text-slate-400 hover:text-slate-600 underline">
                        Agora não
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-5 shadow-lg border border-indigo-200 animate-in fade-in slide-in-from-right-4">
            <h3 className="font-bold text-slate-800 text-sm mb-1 text-center">Opcional</h3>
            <p className="text-xs text-slate-500 mb-3 text-center">O que motivou sua nota? Tem alguma sugestão para melhorarmos?</p>

            <form onSubmit={handleSubmit}>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Seu feedback anônimo..."
                    className="w-full text-sm border border-slate-200 rounded-lg p-3 min-h-[80px] bg-slate-50 mb-3 focus:bg-white transition-colors"
                />

                <div className="flex gap-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleSubmit()} disabled={loading}>
                        Pular
                    </Button>
                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar Feedback'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
