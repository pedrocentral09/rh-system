import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { updateAutomationSettings, processAutomatedEvaluations } from '../actions/automation';
import { getReviewQuestions } from '../actions/cycles';

interface AutomationSettings {
    id: string;
    isActive: boolean;
    methodology: string;
    autoCloseDays: number;
    checkIntervalDays: number;
    selectedCategories: string[];
    selectedQuestionIds: string[];
    lastRun: Date | null;
}

interface Question {
    id: string;
    category: string;
    text: string;
}

export function PerformanceAutomation({ initialSettings }: { initialSettings: AutomationSettings }) {
    const [settings, setSettings] = useState(initialSettings);
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        const result = await getReviewQuestions();
        if (result.success && result.data) {
            setQuestions(result.data as any);
            const cats = Array.from(new Set((result.data as any).map((q: any) => q.category))) as string[];
            setCategories(cats);
        }
    };

    const handleSave = async (updatedSettings: Partial<AutomationSettings>) => {
        setLoading(true);
        const newData = { ...settings, ...updatedSettings };
        const result = await updateAutomationSettings(newData);

        if (result.success) {
            setSettings(newData as AutomationSettings);
            toast.success('Configurações atualizadas');
        } else {
            toast.error(result.error || 'Erro ao salvar');
        }
        setLoading(false);
    };

    const toggleCategory = (cat: string) => {
        const current = settings.selectedCategories || [];
        const next = current.includes(cat)
            ? current.filter(c => c !== cat)
            : [...current, cat];
        handleSave({ selectedCategories: next });
    };

    const handleRunNow = async () => {
        setProcessing(true);
        toast.info('Iniciando processamento das avaliações...');
        const result = await processAutomatedEvaluations();

        if (result.success) {
            toast.success(result.message);
            setSettings(prev => ({ ...prev, lastRun: new Date() }));
        } else {
            toast.error(result.error || 'Erro ao processar');
        }
        setProcessing(false);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card className={`border-2 transition-all ${settings.isActive ? 'border-indigo-200 bg-indigo-50/10 dark:bg-indigo-900/10' : 'border-slate-200'}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            <span>🤖</span> Motor de Automação
                        </CardTitle>
                        <CardDescription>
                            Gere ciclos de avaliação automaticamente com base no cronograma de cada colaborador.
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-full ${settings.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {settings.isActive ? 'Ativo' : 'Pausado'}
                        </span>
                        <Button
                            variant={settings.isActive ? 'outline' : 'primary'}
                            size="sm"
                            disabled={loading}
                            onClick={() => handleSave({ isActive: !settings.isActive })}
                        >
                            {settings.isActive ? 'Pausar Automação' : 'Ativar Agora'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Recurrence Settings */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Recorrência</h4>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Frequência de Checagem</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            type="number"
                                            value={settings.checkIntervalDays || 1}
                                            onChange={e => handleSave({ checkIntervalDays: parseInt(e.target.value) })}
                                            className="w-20 h-9"
                                        />
                                        <span className="text-xs text-slate-500">Dias</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Fechamento Automático</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Input
                                            type="number"
                                            value={settings.autoCloseDays || 15}
                                            onChange={e => handleSave({ autoCloseDays: parseInt(e.target.value) })}
                                            className="w-20 h-9"
                                        />
                                        <span className="text-xs text-slate-500">Dias para encerrar</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Question Settings */}
                        <div className="md:col-span-2 space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Banco de Perguntas da Automação</h4>
                            <div className="flex flex-wrap gap-2">
                                {categories.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic">Nenhuma categoria cadastrada no banco de perguntas.</p>
                                ) : (
                                    categories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${settings.selectedCategories?.includes(cat)
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-slate-200 text-slate-500 hover:border-indigo-300'}`}
                                        >
                                            {cat} {settings.selectedCategories?.includes(cat) && '✓'}
                                        </button>
                                    ))
                                )}
                            </div>
                            <p className="text-[10px] text-slate-500">
                                {settings.selectedCategories?.length === 0
                                    ? 'Selecione as categorias que o motor deve incluir nos ciclos.'
                                    : `O motor usará perguntas das ${settings.selectedCategories?.length} categorias selecionadas.`}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {/* Methodology Selection */}
                        <div className="md:col-span-2 space-y-4">
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Metodologia Padrão</h4>
                            <div className="grid grid-cols-3 gap-3">
                                {['TOP_DOWN', '360', 'SELF'].map((m) => (
                                    <button
                                        key={m}
                                        onClick={() => handleSave({ methodology: m })}
                                        className={`p-3 rounded-xl border text-center transition-all ${settings.methodology === m
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold'
                                            : 'border-slate-200 hover:border-indigo-300 text-slate-500'}`}
                                    >
                                        <div className="text-sm">{m === 'TOP_DOWN' ? 'Apenas Gestor' : m === '360' ? '360º Graus' : 'Auto'}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Runner */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status do Motor</h4>
                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {settings.lastRun ? `Última vez: ${format(new Date(settings.lastRun), 'dd/MM HH:mm')}` : 'Nunca executado'}
                                </div>
                            </div>
                            <Button
                                className="w-full mt-4 h-9 text-xs font-bold"
                                variant="outline"
                                disabled={processing}
                                onClick={handleRunNow}
                            >
                                {processing ? 'Processando...' : 'Rodar Manualmente'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-xl flex gap-3 text-sm text-indigo-800 dark:text-indigo-400">
                <span className="text-xl">✨</span>
                <div>
                    <p className="font-bold">Resumo da Configuração:</p>
                    <p className="text-xs mt-1">
                        O motor despertará a cada <strong>{settings.checkIntervalDays} dia(s)</strong> para verificar novos colaboradores no prazo.
                        Ao criar o ciclo, usará a metodologia <strong>{settings.methodology}</strong> com as perguntas das categorias:
                        {settings.selectedCategories?.length === 0 ? ' [Nenhuma selecionada - usará todas]' : ` ${settings.selectedCategories?.join(', ')}`}.
                    </p>
                </div>
            </div>
        </div>
    );
}
