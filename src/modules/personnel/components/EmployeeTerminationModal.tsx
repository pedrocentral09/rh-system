'use client';

import { Modal } from '@/shared/components/ui/modal';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useState } from 'react';
import { terminateEmployee } from '../actions';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeTerminationModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: any;
    onSuccess: () => void;
}

export function EmployeeTerminationModal({ isOpen, onClose, employee, onSuccess }: EmployeeTerminationModalProps) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    if (!employee) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!date || !reason) {
            toast.error('Por favor, preencha todos os campos.');
            return;
        }

        if (!confirm(`Confirma o desligamento de ${employee.name}?`)) return;

        setLoading(true);
        const result = await terminateEmployee(employee.id, new Date(date), reason);
        setLoading(false);

        if (result.success) {
            toast.success('Colaborador desligado com sucesso.');
            onSuccess();
        } else {
            toast.error(result.error || 'Erro ao desligar colaborador.');
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Desligamento: ${employee.name}`} width="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-red-50 border border-red-200 p-3 rounded text-sm text-red-800">
                    ⚠️ Atenção: Esta ação encerrará o contrato atual e inativará o colaborador.
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data do Desligamento</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo / Justificativa</label>
                    <textarea
                        className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Pedido de demissão, Corte de custos..."
                        required
                    />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : '🚫'} Confimar Desligamento
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
