
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Settings2, Save, Plus, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { getPayrollSettings, updatePayrollSettings, getTaxTable, updateTaxTable } from '../actions/settings';

export function PayrollSettingsModal() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState<any>(null);
    const [inssTable, setInssTable] = useState<any>(null);
    const [irrfTable, setIrrfTable] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'inss' | 'irrf'>('general');

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            console.log('[PayrollSettings] Loading data...');
            const s = await getPayrollSettings();
            console.log('[PayrollSettings] Settings:', s);

            const inss = await getTaxTable('INSS');
            const irrf = await getTaxTable('IRRF');

            if (s.success) {
                console.log('[PayrollSettings] Data loaded successfully:', s.data);
                setSettings(s.data);
            } else {
                console.error('[PayrollSettings] Action returned error:', s.error);
                toast.error(`Falha ao carregar configurações: ${s.error}`);
            }

            if (inss.success) setInssTable(inss.data);
            if (irrf.success) setIrrfTable(irrf.data);
        } catch (error) {
            console.error('[PayrollSettings] Load error:', error);
            toast.error('Erro de conexão ao carregar parâmetros.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveSettings() {
        if (!settings) return;
        setLoading(true);
        const res = await updatePayrollSettings(settings);
        if (res.success) {
            toast.success('Configurações salvas!');
        } else {
            toast.error('Erro ao salvar configurações.');
        }
        setLoading(false);
    }

    async function handleSaveTable(name: string, data: any) {
        if (!data) return;
        setLoading(true);
        const res = await updateTaxTable(name, 2024, data.brackets);
        if (res.success) {
            toast.success(`Tabela de ${name} atualizada!`);
        } else {
            toast.error(`Erro ao atualizar ${name}.`);
        }
        setLoading(false);
    }

    const addBracket = (setTable: any) => {
        setTable((prev: any) => {
            if (!prev) return { name: activeTab.toUpperCase(), year: 2024, brackets: [{ limit: 0, rate: 0, deduction: 0 }] };
            return {
                ...prev,
                brackets: [...(prev.brackets || []), { limit: 0, rate: 0, deduction: 0 }]
            };
        });
    };

    const removeBracket = (setTable: any, index: number) => {
        setTable((prev: any) => {
            if (!prev || !prev.brackets) return prev;
            return {
                ...prev,
                brackets: prev.brackets.filter((_: any, i: number) => i !== index)
            };
        });
    };

    const updateBracket = (setTable: any, index: number, field: string, value: string) => {
        setTable((prev: any) => {
            if (!prev || !prev.brackets) return prev;
            const newBrackets = [...prev.brackets];
            newBrackets[index] = { ...newBrackets[index], [field]: Number(value) };
            return { ...prev, brackets: newBrackets };
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800">
                    <Settings2 className="w-4 h-4" />
                    Configurações de Folha
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center justify-between text-indigo-400 w-full">
                        <div className="flex items-center gap-2">
                            <Settings2 className="w-6 h-6" />
                            Parâmetros Legais da Folha
                        </div>
                        <span className="text-[10px] text-slate-600 font-mono pt-1">v3.1-resilient</span>
                    </DialogTitle>
                </DialogHeader>

                {loading && !settings ? (
                    <div className="flex flex-col items-center justify-center p-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                        <p className="text-slate-400">Carregando tabelas dinâmicas...</p>
                    </div>
                ) : (
                    <div className="space-y-6 mt-4">
                        <div className="flex border-b border-slate-800">
                            <button
                                onClick={() => setActiveTab('general')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'general' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Geral
                            </button>
                            <button
                                onClick={() => setActiveTab('inss')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'inss' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Tabela INSS
                            </button>
                            <button
                                onClick={() => setActiveTab('irrf')}
                                className={`px-6 py-2 text-sm font-medium transition-colors ${activeTab === 'irrf' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Tabela IRRF
                            </button>
                        </div>

                        {activeTab === 'general' && (
                            settings ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Salário Mínimo Vigente (R$)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={settings.minimumWage}
                                                onChange={(e) => setSettings({ ...settings, minimumWage: Number(e.target.value) })}
                                                className="bg-slate-900 border-slate-800 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Teto Salário Família (Até R$)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={settings.familySalaryLimit}
                                                onChange={(e) => setSettings({ ...settings, familySalaryLimit: Number(e.target.value) })}
                                                className="bg-slate-900 border-slate-800 text-white"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-400">Valor Cota Salário Família (R$)</label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                value={settings.familySalaryValue}
                                                onChange={(e) => setSettings({ ...settings, familySalaryValue: Number(e.target.value) })}
                                                className="bg-slate-900 border-slate-800 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <Button onClick={handleSaveSettings} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                            Salvar Configurações Gerais
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                    Não foi possível carregar as configurações gerais. Tente novamente mais tarde.
                                </div>
                            )
                        )}

                        {(activeTab === 'inss' || activeTab === 'irrf') && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                <p className="text-xs text-slate-500 italic">
                                    Defina as faixas de cálculo progressivo. Para a última faixa (teto/final), use um valor alto como limite (ex: 999999).
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-slate-800">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider">
                                            <tr>
                                                <th className="px-4 py-3">Limite Superior (R$)</th>
                                                <th className="px-4 py-3 text-center">Alíquota (%)</th>
                                                {activeTab === 'irrf' && <th className="px-4 py-3">Parcela a Deduzir (R$)</th>}
                                                <th className="px-4 py-3 text-right">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {(activeTab === 'inss' ? inssTable : irrfTable)?.brackets.map((b: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-slate-900/50">
                                                    <td className="px-4 py-2">
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={b.limit}
                                                            onChange={(e) => updateBracket(activeTab === 'inss' ? setInssTable : setIrrfTable, idx, 'limit', e.target.value)}
                                                            className="w-32 h-8 bg-transparent border-slate-700"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={b.rate}
                                                                onChange={(e) => updateBracket(activeTab === 'inss' ? setInssTable : setIrrfTable, idx, 'rate', e.target.value)}
                                                                className="w-20 h-8 bg-transparent border-slate-700 text-center"
                                                            />
                                                            <span className="text-slate-500">%</span>
                                                        </div>
                                                    </td>
                                                    {activeTab === 'irrf' && (
                                                        <td className="px-4 py-2">
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                value={b.deduction}
                                                                onChange={(e) => updateBracket(setIrrfTable, idx, 'deduction', e.target.value)}
                                                                className="w-32 h-8 bg-transparent border-slate-700"
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeBracket(activeTab === 'inss' ? setInssTable : setIrrfTable, idx)}
                                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 w-8"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => addBracket(activeTab === 'inss' ? setInssTable : setIrrfTable)}
                                        className="border-slate-800 text-slate-400 hover:text-white"
                                    >
                                        <Plus className="w-4 h-4 mr-2" /> Adicionar Faixa
                                    </Button>
                                    <Button
                                        onClick={() => handleSaveTable(activeTab.toUpperCase(), activeTab === 'inss' ? inssTable : irrfTable)}
                                        disabled={loading}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                    >
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                                        Atualizar Tabela {activeTab.toUpperCase()}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
