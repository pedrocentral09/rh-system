'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase/admin';
import { logAction } from './audit';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
    const token = formData.get('token') as string;

    if (!token) {
        return { success: false, error: 'Token de autenticação ausente' };
    }

    try {
        console.log('--- LOGIN ACTION STARTED ---');
        // 1. Verify Firebase Token
        console.log('1. Verifying Firebase Token...');
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { uid, email } = decodedToken;
        console.log('Token verified. UID:', uid, 'Email:', email);

        if (!email) throw new Error('E-mail é obrigatório para o login');

        // 2. Sync User
        console.log('2. Finding User in DB...');
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            console.log('User not found. Creating new user...');
            user = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    email: email,
                    name: decodedToken.name || email.split('@')[0],
                    role: 'EMPLOYEE',
                },
            });
            await logAction('USER_CREATED', 'User', { id: user.id, email }, user.id);
            console.log('User created:', user.id);
        } else {
            console.log('User found:', user.id, user.role);
        }

        // 3. Set Session Cookie
        console.log('3. Setting Session Cookie...');
        const cookieStore = await cookies();
        // Set cookie for 7 days
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        cookieStore.set('hr_session', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires,
            sameSite: 'lax',
            path: '/',
        });

        await logAction('LOGIN', 'Auth', { method: 'firebase' }, user.id);
        console.log('--- LOGIN SUCCESS ---');

        return { success: true };
    } catch (error: any) {
        console.error('Login error:', error);
        // Retorna erro detalhado para debug
        return {
            success: false,
            error: `Falha na autenticação: ${error.message} (Code: ${error.code})`
        };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('hr_session');
    redirect('/login');
}

export async function devLoginAction() {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('Not allowed in production');
    }

    const email = 'admin@dev.local';
    const uid = 'dev-admin-uid';

    let user = await prisma.user.findUnique({
        where: { firebaseUid: uid },
    });

    if (!user) {
        user = await prisma.user.create({
            data: {
                firebaseUid: uid,
                email: email,
                name: 'Dev Admin',
                role: 'ADMIN',
            },
        });
    } else {
        // Ensure user is admin
        if (user.role !== 'ADMIN') {
            await prisma.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' },
            });
        }
    }

    const cookieStore = await cookies();
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    cookieStore.set('hr_session', user.id, {
        httpOnly: true,
        secure: false, // Always false since this action throws in production
        expires,
        sameSite: 'lax',
        path: '/',
    });

    redirect('/dashboard');
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const userId = cookieStore.get('hr_session')?.value;

        if (!userId) return null;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        return user;
    } catch (error) {
        return null;
    }
}

export async function requireAuth(allowedRoles?: string[]) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate home based on Role
        if (user.role === 'EMPLOYEE') {
            redirect('/portal');
        } else {
            redirect('/dashboard');
        }
    }

    return user;
}
