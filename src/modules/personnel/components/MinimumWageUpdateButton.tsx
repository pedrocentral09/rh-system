
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { TrendingUp, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { updateMinimumWageSalaries, getPayrollSettings } from '@/modules/payroll/actions/settings';

export function MinimumWageUpdateButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentWage, setCurrentWage] = useState<number>(0);
    const [newWage, setNewWage] = useState<number>(0);
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [updatedCount, setUpdatedCount] = useState(0);

    const handleOpen = async () => {
        setLoading(true);
        const res = await getPayrollSettings();
        if (res.success && res.data) {
            setCurrentWage(res.data.minimumWage);
            setNewWage(res.data.minimumWage);
        }
        setLoading(false);
        setOpen(true);
    };

    const handleUpdate = async () => {
        if (newWage <= currentWage) {
            toast.error('O novo salário deve ser maior que o atual.');
            return;
        }

        setLoading(true);
        const res = await updateMinimumWageSalaries(newWage);
        if (res.success) {
            setUpdatedCount(res.updated || 0);
            setStep('success');
            toast.success('Salários atualizados com sucesso!');
        } else {
            toast.error('Erro ao atualizar salários.');
        }
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val);
            if (!val) setStep('form');
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    onClick={handleOpen}
                    className="flex items-center gap-2 border-amber-900/50 bg-amber-950/20 text-amber-400 hover:bg-amber-950/40 hover:text-amber-300"
                >
                    <TrendingUp className="w-4 h-4" />
                    Reajuste Salário Mínimo
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-950 border-slate-800 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-400">
                        <TrendingUp className="w-5 h-5" />
                        Atualização Salarial em Lote
                    </DialogTitle>
                </DialogHeader>

                {step === 'form' ? (
                    <div className="space-y-6 pt-4">
                        <div className="p-4 bg-amber-900/10 border border-amber-900/30 rounded-lg flex gap-3 items-start">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                            <div className="text-sm text-amber-200/80">
                                Esta ação irá identificar todos os funcionários que atualmente recebem <strong>R$ {currentWage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> (Salário Mínimo Vigente) e atualizar seus contratos para o novo valor.
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Novo Salário Mínimo (R$)</label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    value={newWage}
                                    onChange={(e) => setNewWage(Number(e.target.value))}
                                    className="bg-slate-900 border-slate-800 text-xl font-bold text-white h-12"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                                Cancelar
                            </Button>
                            <Button onClick={handleUpdate} disabled={loading || newWage <= currentWage} className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : 'Confirmar Atualização'}
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in-95 duration-300">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white">Atualização Concluída!</h3>
                            <p className="text-slate-400 mt-1">
                                <strong>{updatedCount}</strong> contratos foram atualizados para <strong>R$ {newWage.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                            </p>
                        </div>
                        <Button onClick={() => setOpen(false)} className="mt-4 bg-slate-800 hover:bg-slate-700 px-10">
                            Fechar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
