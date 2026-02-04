'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { adjustTimeRecords } from '@/modules/time-tracking/actions/timesheet';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface TimeAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    employeeId: string;
    employeeName: string;
    date: string;
    currentPunches: string[];
    onSuccess: () => void;
}

export function TimeAdjustmentModal({
    isOpen,
    onClose,
    employeeId,
    employeeName,
    date,
    currentPunches,
    onSuccess
}: TimeAdjustmentModalProps) {
    const [punches, setPunches] = useState<string[]>(currentPunches);
    const [justification, setJustification] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddPunch = () => {
        setPunches([...punches, '00:00']);
    };

    const handleRemovePunch = (index: number) => {
        const newPunches = [...punches];
        newPunches.splice(index, 1);
        setPunches(newPunches);
    };

    const handlePunchChange = (index: number, value: string) => {
        const newPunches = [...punches];
        newPunches[index] = value;
        setPunches(newPunches);
    };

    const handleSave = async () => {
        if (!justification.trim()) {
            toast.error('A justificativa é obrigatória.');
            return;
        }

        setLoading(true);
        // Ensure punches are sorted and valid format (simple check)
        const sortedPunches = punches.sort();

        const res = await adjustTimeRecords(employeeId, date, sortedPunches, justification);
        setLoading(false);

        if (res.success) {
            toast.success('Ajuste salvo com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error('Erro ao salvar ajuste.');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Ajuste de Ponto - ${date.split('-').reverse().join('/')}`}
            width="md"
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Funcionário</label>
                    <p className="text-slate-900 dark:text-slate-100">{employeeName}</p>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Batidas</label>
                        <Button variant="ghost" size="sm" onClick={handleAddPunch} className="text-indigo-600">
                            <Plus className="h-4 w-4 mr-1" /> Adicionar
                        </Button>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {punches.map((p, i) => (
                            <div key={i} className="flex gap-2">
                                <Input
                                    type="time"
                                    value={p}
                                    onChange={(e) => handlePunchChange(i, e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemovePunch(i)}
                                    className="text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {punches.length === 0 && (
                            <p className="text-sm text-slate-400 italic text-center py-2">Sem batidas registradas.</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Justificativa (Obrigatório)</label>
                    <textarea
                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        rows={3}
                        placeholder="Ex: Esquecimento de batida, Abono médico..."
                        value={justification}
                        onChange={(e) => setJustification(e.target.value)}
                    />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Salvar Ajuste
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
