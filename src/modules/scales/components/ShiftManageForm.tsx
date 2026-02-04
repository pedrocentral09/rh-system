'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { createShiftType, deleteShiftType } from '../actions';

interface ShiftType {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    breakDuration: number;
}

export function ShiftManageForm({ existingShifts }: { existingShifts: ShiftType[] }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        await createShiftType(formData);
        (event.target as HTMLFormElement).reset();
        setLoading(false);
    }

    async function handleDelete(id: string) {
        if (confirm('Tem certeza que deseja excluir este turno?')) {
            await deleteShiftType(id);
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Create Form */}
            <Card className="shadow-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-fit">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-white">Novo Turno</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Cadastre um horário de trabalho padrão.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nome do Turno</label>
                            <Input name="name" placeholder="Ex: Manhã A, 12x36..." required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Entrada</label>
                                <Input type="time" name="startTime" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Saída</label>
                                <Input type="time" name="endTime" required />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Intervalo (minutos)</label>
                            <Input type="number" name="breakDuration" defaultValue="60" required />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                            {loading ? 'Salvando...' : '➕ Criar Turno'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <Card className="shadow-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-800 dark:text-white">Turnos Cadastrados</CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">Horários disponíveis para escala.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {existingShifts.length === 0 && (
                            <p className="text-slate-500 text-center py-4">Nenhum turno cadastrado.</p>
                        )}
                        {existingShifts.map((shift) => (
                            <div key={shift.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-500/30 transition-colors">
                                <div>
                                    <h4 className="text-slate-800 dark:text-slate-200 font-medium">{shift.name}</h4>
                                    <p className="text-sm text-indigo-600 dark:text-indigo-400 font-mono">
                                        {shift.startTime} - {shift.endTime} <span className="text-slate-500 dark:text-slate-600 mx-1">|</span> {shift.breakDuration}m intervalo
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(shift.id)}
                                    className="text-slate-400 hover:text-red-400 hover:bg-red-400/10"
                                >
                                    🗑️
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
