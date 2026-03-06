import { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import { RefreshCw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { getLastSync } from '../actions';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

import { motion } from 'framer-motion';

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
            await fetchLastSync();
            router.refresh();

            toast.success('Sync Interface OK', {
                description: 'Verificação de pulsos AFD concluída.'
            });
        } catch (error: any) {
            toast.error('Erro de Sincronia', {
                description: error.message
            });
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="flex flex-col items-end gap-2 group">
            <button
                onClick={handleSync}
                disabled={isSyncing}
                className="h-10 px-6 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/10 hover:border-brand-orange/30 transition-all flex items-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
            >
                <RefreshCw className={`h-3.5 w-3.5 text-brand-orange ${isSyncing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                {isSyncing ? 'PROCESSANDO NODE...' : 'SINCRONIZAR TERMINAL'}
            </button>
            {lastSync && (
                <div className="flex items-center text-[8px] font-black text-slate-600 uppercase tracking-widest gap-2 bg-white/[0.02] px-3 py-1 rounded-full border border-white/5">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,1)]" />
                    ÚLTIMO RECEBIMENTO: {format(lastSync, "HH:mm 'BRT' - dd/MM", { locale: ptBR })}
                </div>
            )}
        </div>
    );
}
