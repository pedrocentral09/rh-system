'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { changePinAction } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { toast } from 'sonner';

interface ChangePinFormProps {
    employeeId: string;
    isFirstAccess?: boolean;
}

export function ChangePinForm({ employeeId, isFirstAccess = false }: ChangePinFormProps) {
    const [currentPin, setCurrentPin] = useState('');
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const sanitizeDigits = (value: string, max: number) =>
        value.replace(/\D/g, '').slice(0, max);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPin !== confirmPin) {
            setError('Os PINs não coincidem.');
            return;
        }
        if (newPin.length !== 6) {
            setError('O PIN deve ter exatamente 6 dígitos.');
            return;
        }

        startTransition(async () => {
            const result = await changePinAction(employeeId, currentPin, newPin);

            if (result.success) {
                toast.success('PIN alterado com sucesso!');
                router.push('/portal');
            } else {
                setError(result.error || 'Erro ao trocar o PIN.');
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-sm shadow-xl border-0 overflow-hidden">
                <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 to-orange-500" />

                <CardHeader className="pt-6 pb-2">
                    <div className="text-center">
                        {isFirstAccess && (
                            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium px-3 py-1 rounded-full mb-3">
                                🔐 Primeiro Acesso
                            </div>
                        )}
                        <h1 className="text-xl font-bold text-slate-800">
                            {isFirstAccess ? 'Crie seu PIN pessoal' : 'Trocar PIN'}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">
                            {isFirstAccess
                                ? 'Por segurança, defina um novo PIN antes de continuar.'
                                : 'Escolha um PIN de 6 dígitos numéricos.'}
                        </p>
                    </div>
                </CardHeader>

                <CardContent className="pt-4 pb-6 px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">
                                {isFirstAccess ? 'PIN recebido do RH' : 'PIN atual'}
                            </label>
                            <Input
                                id="current-pin"
                                type="password"
                                inputMode="numeric"
                                placeholder="••••••"
                                value={currentPin}
                                onChange={(e) => setCurrentPin(sanitizeDigits(e.target.value, 6))}
                                required
                                maxLength={6}
                                className="text-center tracking-[0.5em] text-lg font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Novo PIN</label>
                            <Input
                                id="new-pin"
                                type="password"
                                inputMode="numeric"
                                placeholder="••••••"
                                value={newPin}
                                onChange={(e) => setNewPin(sanitizeDigits(e.target.value, 6))}
                                required
                                maxLength={6}
                                className="text-center tracking-[0.5em] text-lg font-mono"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-700">Confirmar novo PIN</label>
                            <Input
                                id="confirm-pin"
                                type="password"
                                inputMode="numeric"
                                placeholder="••••••"
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(sanitizeDigits(e.target.value, 6))}
                                required
                                maxLength={6}
                                className={`text-center tracking-[0.5em] text-lg font-mono ${confirmPin && confirmPin !== newPin ? 'border-red-400 focus-visible:ring-red-300' : ''}`}
                            />
                            {confirmPin && confirmPin !== newPin && (
                                <p className="text-xs text-red-500">Os PINs não coincidem</p>
                            )}
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
                                <p className="text-sm text-red-700 text-center">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5"
                            disabled={isPending || currentPin.length < 6 || newPin.length < 6 || confirmPin.length < 6}
                        >
                            {isPending ? 'Salvando...' : 'Salvar novo PIN'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
