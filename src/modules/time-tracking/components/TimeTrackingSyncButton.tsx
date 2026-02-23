import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getLastSync } from '../actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export function TimeTrackingSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<Date | null>(null);
    const router = useRouter();

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
            // As batidas agora são enviadas automaticamente pelo Coletor (Webhook).
            // O botão serve apenas para recarregar a interface e buscar a última data.
            await fetchLastSync();
            router.refresh();

            toast.success('Interface atualizada!', {
                description: 'Verificando últimos pontos recebidos pelo servidor.'
            });
        } catch (error: any) {
            toast.error('Erro ao atualizar', {
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
                {isSyncing ? 'Atualizando...' : 'Atualizar Dados'}
            </Button>
            {lastSync && (
                <div className="flex items-center text-[10px] text-slate-400 gap-1">
                    <Clock className="w-3 h-3" />
                    Último recebimento: {format(lastSync, "HH:mm 'de' dd/MM", { locale: ptBR })}
                </div>
            )}
        </div>
    );
}
