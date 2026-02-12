'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export function TimeTrackingSyncButton() {
    const [isSyncing, setIsSyncing] = useState(false);

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

            if (data.status === 'partial') {
                toast.warning(`Sincronização parcial (${data.filesProcessed} arquivos processados)`, {
                    description: `${data.errors.length} erros encontrados.`
                });
            } else {
                toast.success('Sincronização concluída com sucesso!', {
                    description: `${data.filesProcessed} arquivos processados. ${data.punchesImported} novos pontos.`
                });
            }
        } catch (error: any) {
            toast.error('Erro ao sincronizar', {
                description: error.message
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
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
    );
}
