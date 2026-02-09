
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Label } from '@/shared/components/ui/label';
import { createPayrollPeriod } from '../actions/periods';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export function CreatePeriodButton() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Default to next month if current day > 20, else current month? 
    // Let's just default to Current Month.
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12
    const [year, setYear] = useState(today.getFullYear());

    async function handleCreate() {
        setLoading(true);
        const res = await createPayrollPeriod(Number(month), Number(year));
        setLoading(false);

        if (res.success) {
            toast.success('Competência criada com sucesso!');
            setOpen(false);
        } else {
            toast.error(res.error || 'Erro ao criar competência.');
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                    + Nova Competência
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Abrir Nova Competência</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Mês</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-slate-300 px-3"
                                value={month}
                                onChange={(e) => setMonth(Number(e.target.value))}
                            >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                    <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Ano</Label>
                            <input
                                type="number"
                                className="flex h-10 w-full rounded-md border border-slate-300 px-3"
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                            />
                        </div>
                    </div>
                    <Button onClick={handleCreate} disabled={loading} className="w-full mt-2">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Competência'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
