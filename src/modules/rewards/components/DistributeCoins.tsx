'use client';

import { useState } from 'react';
import { grantCoins } from '@/modules/rewards/actions/coins';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { toast } from 'sonner';

interface Employee {
    id: string;
    name: string;
    jobRole: { name: string } | null;
}

export function DistributeCoins({ employees }: { employees: Employee[] }) {
    const [employeeId, setEmployeeId] = useState('');
    const [amount, setAmount] = useState(50);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await grantCoins({ employeeId, amount, description, source: 'MANAGER' });

        if (result.success) {
            toast.success(`${amount} moedas enviadas com sucesso!`);
            setEmployeeId('');
            setAmount(50);
            setDescription('');
        } else {
            toast.error(result.error || 'Erro ao enviar moedas');
        }
        setLoading(false);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm max-w-2xl">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Reconhecer Esforço</h2>
            <p className="text-sm text-slate-500 mb-6">Envie Família Coins manualmente para recompensar um trabalho excepcional.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Colaborador</label>
                    <select
                        required
                        value={employeeId}
                        onChange={e => setEmployeeId(e.target.value)}
                        className="w-full text-sm border-slate-200 rounded-lg dark:bg-slate-900 border p-2"
                    >
                        <option value="">Selecione quem vai receber...</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.jobRole?.name || 'Sem cargo'})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-600 block mb-1">Quantidade de Moedas</label>
                        <Input required type="number" min="1" step="10" value={amount} onChange={e => setAmount(Number(e.target.value))} />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Motivo / Mensagem</label>
                    <Input required value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Bateu a meta de vendas do mês! Parabuains!" />
                </div>

                <div className="pt-4">
                    <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                        {loading ? 'Enviando...' : `Enviar ${amount} Família Coins 🪙`}
                    </Button>
                </div>
            </form>
        </div>
    );
}
