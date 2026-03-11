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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-1 sm:p-0">
            {/* Create Form */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border rounded-[2.5rem] shadow-2xl overflow-hidden h-fit group">
                <CardHeader>
                <CardTitle className="text-xl font-[1000] text-text-primary uppercase tracking-tighter italic">Novo <span className="text-brand-orange">Turno</span></CardTitle>
                <CardDescription className="text-text-muted text-[10px] font-black uppercase tracking-widest mt-1">Cadastre um horário de trabalho padrão.</CardDescription>
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
                        <Button type="submit" disabled={loading} className="w-full h-12 bg-brand-orange hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-brand-orange/20 text-[10px] font-black uppercase tracking-widest mt-6">
                            {loading ? 'Salvando...' : '➕ Criar Turno'}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* List */}
            <Card className="bg-surface/40 backdrop-blur-xl border-border rounded-[2.5rem] shadow-2xl overflow-hidden group">
                <CardHeader>
                <CardTitle className="text-xl font-[1000] text-text-primary uppercase tracking-tighter italic">Turnos <span className="text-brand-orange">Ativos</span></CardTitle>
                <CardDescription className="text-text-muted text-[10px] font-black uppercase tracking-widest mt-1">Configurações para escalas vigentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {existingShifts.length === 0 && (
                            <p className="text-slate-500 text-center py-4">Nenhum turno cadastrado.</p>
                        )}
                        {existingShifts.map((shift) => (
                            <div key={shift.id} className="flex items-center justify-between p-6 rounded-[1.8rem] bg-surface-secondary/40 border border-border/5 hover:border-brand-orange/30 hover:bg-surface transition-all duration-500 group/item">
                                <div>
                                    <h4 className="text-text-primary font-black uppercase tracking-tighter text-sm italic group-hover/item:text-brand-orange transition-colors">{shift.name}</h4>
                                    <p className="text-[10px] text-brand-orange font-black uppercase tracking-widest mt-1">
                                        {shift.startTime} <span className="opacity-30 mx-1">→</span> {shift.endTime} <span className="text-text-muted/20 mx-2">|</span> {shift.breakDuration}m pausa
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
