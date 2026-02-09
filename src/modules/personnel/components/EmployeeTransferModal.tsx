'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Modal } from '@/shared/components/ui/modal';
import { registerTransfer } from '../actions';
import { toast } from 'sonner';
// import { getCompanySettings } from '@/modules/configuration/actions/settings'; // Not exported yet, using mock for now

interface EmployeeTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: {
        id: string;
        name: string;
        contract?: {
            store: string;
        };
    };
    onSuccess: () => void;
}

export function EmployeeTransferModal({ isOpen, onClose, employee, onSuccess }: EmployeeTransferModalProps) {
    if (!employee) return null;

    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState<string[]>([]);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [newStore, setNewStore] = useState('');
    const [reason, setReason] = useState('Transferência');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadStores();
            // Reset form
            setDate(new Date().toISOString().split('T')[0]);
            setNewStore('');
            setReason('Transferência');
            setNotes('');
        }
    }, [isOpen]);

    const loadStores = async () => {
        // In a real app, we would fetch active stores from a Store module.
        // For now, we can fetch from Company Settings or hardcoded list if not yet implemented.
        // Let's assume we have a list of stores in settings or we mock it for now as per "Corporate Light" theme standard.
        // TODO: Replace with real store fetch
        setStores(['Matriz', 'Filial Centro', 'Filial Norte', 'Filial Sul', 'GAMELEIRA', 'CONTAGEM', 'BETIM']);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await registerTransfer({
            employeeId: employee.id,
            date: new Date(date),
            newStore,
            reason,
            notes
        });

        if (result.success) {
            toast.success('Transferência realizada com sucesso!');
            onSuccess();
            onClose();
        } else {
            toast.error(result.error || 'Erro ao realizar transferência');
        }
        setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Registrar Transferência" width="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-4">
                    <p className="text-sm text-slate-500">Colaborador</p>
                    <p className="font-medium text-slate-900">{employee.name}</p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Data da Transferência *</label>
                    <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        className="calendar-light"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Loja Atual</label>
                    <Input
                        value={employee.contract?.store || 'N/A'}
                        disabled
                        className="bg-slate-100 text-slate-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nova Loja *</label>
                    <select
                        value={newStore}
                        onChange={(e) => setNewStore(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        required
                    >
                        <option value="">Selecione</option>
                        {stores.map(store => (
                            <option key={store} value={store} disabled={store === employee.contract?.store}>
                                {store}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Motivo</label>
                    <Input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Ex: Promoção, Necessidade da Loja..."
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Observações</label>
                    <textarea
                        className="flex w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 min-h-[80px]"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Detalhes adicionais..."
                    />
                </div>

                <div className="flex justify-end pt-4 space-x-2 border-t border-slate-200 mt-6">
                    <Button type="button" variant="ghost" onClick={onClose} className="text-slate-600 hover:bg-slate-100 hover:text-slate-900">
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                        {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
