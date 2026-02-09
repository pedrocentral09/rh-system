
'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { reopenPayrollPeriod } from '../actions/periods';
import { toast } from 'sonner';
import { RefreshCw, Loader2, Unlock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/client';
import { EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';

interface ReopenPeriodButtonProps {
    periodId: string;
    isClosed: boolean;
    canReopen?: boolean; // New prop for RBAC
}

export function ReopenPeriodButton({ periodId, isClosed, canReopen = true }: ReopenPeriodButtonProps) {
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isClosed) return null;

    async function handleReopen() {
        if (!password) {
            toast.error('Digite sua senha');
            return;
        }

        const user = auth.currentUser;
        if (!user || !user.email) {
            toast.error('Usuário não autenticado');
            return;
        }

        setLoading(true);

        try {
            // 1. Verify Password with Firebase
            const credential = EmailAuthProvider.credential(user.email, password);
            await reauthenticateWithCredential(user, credential);

            // 2. Call Server Action
            const res = await reopenPayrollPeriod(periodId);

            if (res.success) {
                toast.success('Competência reaberta com segurança!');
                setOpen(false);
                router.refresh();
            } else {
                toast.error('Erro ao reabrir no servidor.');
            }
        } catch (error: any) {
            console.error('Auth Error:', error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                toast.error('Senha incorreta.');
            } else {
                toast.error('Erro de autenticação: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                variant="outline"
                className="text-amber-600 border-amber-200 hover:bg-amber-50"
            >
                <Unlock className="mr-2 h-4 w-4" />
                Reabrir Folha
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reabrir Competência</DialogTitle>
                        <DialogDescription>
                            Esta ação é sensível. Por favor, confirme sua senha para desbloquear a folha para edições.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Sua Senha</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="********"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                        <Button onClick={handleReopen} disabled={loading} className="bg-amber-600 hover:bg-amber-700 text-white">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Unlock className="mr-2 h-4 w-4" />}
                            Confirmar e Reabrir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
