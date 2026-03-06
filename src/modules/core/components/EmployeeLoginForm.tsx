'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cpfPinLoginAction } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';

function formatCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function EmployeeLoginForm() {
    const [cpf, setCpf] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpf(formatCpf(e.target.value));
    };

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
        setPin(digits);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        startTransition(async () => {
            const result = await cpfPinLoginAction(cpf, pin);

            if (result.success) {
                if (result.mustChangePin) {
                    router.push('/portal/change-pin');
                } else {
                    router.push('/portal');
                }
            } else {
                setError(result.error || 'Erro ao tentar entrar.');
            }
        });
    };

    return (
        <Card className="w-full max-w-sm shadow-2xl border-0 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700" />

            <CardHeader className="space-y-4 pb-2 pt-6">
                <div className="flex justify-center">
                    <div className="relative w-44 h-16">
                        <img
                            src="/logo.jpg"
                            alt="Logo"
                            className="object-contain w-full h-full"
                        />
                    </div>
                </div>
                <div className="text-center">
                    <h1 className="text-xl font-bold text-slate-800">Acesso do Colaborador</h1>
                    <p className="text-sm text-slate-500 mt-1">Use seu CPF e PIN de 6 dígitos</p>
                </div>
            </CardHeader>

            <CardContent className="pt-4 pb-6 px-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* CPF */}
                    <div className="space-y-1.5">
                        <label htmlFor="cpf-input" className="text-sm font-medium text-slate-700">
                            CPF
                        </label>
                        <Input
                            id="cpf-input"
                            type="text"
                            inputMode="numeric"
                            placeholder="000.000.000-00"
                            value={cpf}
                            onChange={handleCpfChange}
                            required
                            className="text-center tracking-widest text-base font-mono"
                            autoComplete="username"
                        />
                    </div>

                    {/* PIN */}
                    <div className="space-y-1.5">
                        <label htmlFor="pin-input" className="text-sm font-medium text-slate-700">
                            PIN (6 dígitos)
                        </label>
                        <Input
                            id="pin-input"
                            type="password"
                            inputMode="numeric"
                            placeholder="••••••"
                            value={pin}
                            onChange={handlePinChange}
                            required
                            maxLength={6}
                            className="text-center tracking-[0.5em] text-lg font-mono"
                            autoComplete="current-password"
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2.5">
                            <p className="text-sm text-red-700 text-center">{error}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5"
                        disabled={isPending || cpf.replace(/\D/g, '').length < 11 || pin.length < 6}
                    >
                        {isPending ? 'Verificando...' : 'Entrar'}
                    </Button>
                </form>

                {/* Admin link */}
                <div className="mt-5 text-center">
                    <a
                        href="/login"
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Acesso Administrativo →
                    </a>
                </div>
            </CardContent>
        </Card>
    );
}
