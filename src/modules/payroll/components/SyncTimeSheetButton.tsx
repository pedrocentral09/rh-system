
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { syncTimeSheetToPayroll } from '../actions/sync';
import { toast } from 'sonner';
import { Clock, Loader2 } from 'lucide-react';

interface SyncButtonProps {
    periodId: string;
    isClosed: boolean;
}

export function SyncTimeSheetButton({ periodId, isClosed }: SyncButtonProps) {
    const [loading, setLoading] = useState(false);

    async function handleSync() {
        if (!confirm('Isso irá importar as horas extras e faltas do Módulo de Ponto para todos os holerites. Deseja continuar?')) return;

        setLoading(true);
        const res = await syncTimeSheetToPayroll(periodId);
        setLoading(false);

        if (res.success) {
            toast.success(res.message);
        } else {
            toast.error(res.error);
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleSync}
            disabled={loading || isClosed}
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
        >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}
            Importar Ponto
        </Button>
    );
}
