
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { closePayrollPeriod } from '../actions/periods';
import { toast } from 'sonner';
import { Lock, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClosePeriodButtonProps {
    periodId: string;
    isClosed: boolean;
}

export function ClosePeriodButton({ periodId, isClosed }: ClosePeriodButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleClose() {
        if (!confirm('Tem certeza? Após fechar, não será possível recalcular holerites.')) return;

        setLoading(true);
        const res = await closePayrollPeriod(periodId);
        setLoading(false);

        if (res.success) {
            toast.success('Competência fechada com sucesso!');
            router.refresh();
        } else {
            toast.error('Erro ao fechar competência.');
        }
    }

    if (isClosed) {
        return (
            <Button disabled variant="outline" className="opacity-70">
                <Lock className="mr-2 h-4 w-4" />
                Competência Fechada
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClose}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
            Fechar Folha
        </Button>
    );
}
