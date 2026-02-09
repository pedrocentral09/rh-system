'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { loginAction } from '@/modules/core/actions/auth';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useRouter } from 'next/navigation';

export function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();

            // Sync with our backend
            const formData = new FormData();
            formData.append('token', token);

            const result = await loginAction(formData);

            if (result.success) {
                router.push('/dashboard');
            } else {
                setError(result.error || 'Failed to login');
            }

        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-[400px] shadow-2xl border-t-4 border-t-brand-orange">
            <CardHeader className="space-y-4">
                <div className="flex justify-center mb-2">
                    <div className="relative w-48 h-20">
                        <img
                            src="/logo.jpg"
                            alt="Rede Família Supermercados"
                            className="object-contain w-full h-full"
                        />
                    </div>
                </div>
                <CardTitle className="text-2xl font-bold text-center text-brand-blue">
                    Portal do RH
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">E-mail</label>
                        <Input
                            type="email"
                            placeholder="exemplo@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Senha</label>
                        <Input
                            type="password"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar no Sistema'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
