'use server';

import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase/admin';
import { logAction } from './audit';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
    const token = formData.get('token') as string;

    if (!token) {
        return { success: false, error: 'Token missing' };
    }

    try {
        // 1. Verify Firebase Token
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { uid, email } = decodedToken;

        if (!email) throw new Error('Email required');

        // 2. Sync User
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    email: email,
                    name: decodedToken.name || email.split('@')[0],
                    role: 'EMPLOYEE',
                },
            });
            await logAction('USER_CREATED', 'User', { id: user.id, email }, user.id);
        }

        // 3. Set Session Cookie
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

        return { success: true };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, error: 'Authentication failed' };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete('hr_session');
    redirect('/login');
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
