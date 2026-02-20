'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';
import { getHolidays, createHoliday, deleteHoliday } from '../actions/holidays';

interface Holiday {
    id: string;
    date: Date | string;
    name: string;
}

export function HolidayManager() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });

    const loadData = async () => {
        setLoading(true);
        const result = await getHolidays();
        if (result.success) {
            setHolidays(result.data || []);
        } else {
            toast.error('Erro ao carregar feriados');
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = async () => {
        if (!newHoliday.date || !newHoliday.name) {
            return toast.error('Preencha data e nome');
        }

        setLoading(true);
        const result = await createHoliday(newHoliday);
        if (result.success) {
            toast.success('Feriado adicionado');
            setNewHoliday({ date: '', name: '' });
            loadData();
        } else {
            toast.error('Erro ao criar feriado');
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Deseja excluir o feriado "${name}"?`)) return;

        setLoading(true);
        const result = await deleteHoliday(id);
        if (result.success) {
            toast.success('Excluído com sucesso');
            loadData();
        } else {
            toast.error('Erro ao excluir');
        }
        setLoading(false);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                        ➕ Novo Feriado
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                        Adicione feriados nacionais, estaduais ou municipais.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Data *</label>
                        <Input
                            type="date"
                            value={newHoliday.date}
                            onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">Nome do Feriado *</label>
                        <Input
                            value={newHoliday.name}
                            onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                            placeholder="Ex: Aniversário da Cidade"
                        />
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full bg-brand-blue hover:bg-blue-800 text-white font-bold"
                    >
                        Criar Feriado
                    </Button>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100/80 dark:bg-slate-900 text-[11px] text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-700 font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4">Feriado</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {loading && holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 animate-pulse">Carregando...</td>
                                </tr>
                            ) : holidays.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">Nenhum feriado cadastrado.</td>
                                </tr>
                            ) : holidays.map((h) => (
                                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs">
                                        {new Date(h.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                        {h.name}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 text-red-500"
                                            onClick={() => handleDelete(h.id, h.name)}
                                        >
                                            🗑️
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
