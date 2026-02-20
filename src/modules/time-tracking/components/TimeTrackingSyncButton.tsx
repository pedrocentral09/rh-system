import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getLastSync } from '../actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TimeTrackingSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);

    const fetchLastSync = async () => {
        const res = await getLastSync();
        if (res.success && res.data) {
            setLastSync(new Date(res.data));
        }
    };

    useEffect(() => {
        fetchLastSync();
    }, []);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await fetch('/api/integrations/afd/sync', {
                method: 'POST',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Falha na sincronização');
            }

            fetchLastSync();
            toast.success('Sincronização concluída!', {
                description: `${data.punchesImported} novos pontos.`
            });
        } catch (error: any) {
            toast.error('Erro ao sincronizar', {
                description: error.message
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                onClick={handleSync}
                variant="outline"
                size="sm"
                disabled={isSyncing}
                className="flex items-center gap-2"
            >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar Ponto'}
            </Button>
            {lastSync && (
                <div className="flex items-center text-[10px] text-slate-400 gap-1">
                    <Clock className="w-3 h-3" />
                    Última sincronização: {format(lastSync, "HH:mm 'de' dd/MM", { locale: ptBR })}
                </div>
            )}
        </div>
    );
}
