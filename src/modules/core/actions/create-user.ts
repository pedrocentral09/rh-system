'use server';

import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase/admin';

export async function createCoreUser(formData: FormData) {
    const token = formData.get('token') as string;
    const name = formData.get('name') as string;

    if (!token) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // 1. Verify token with Firebase Admin
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { uid, email } = decodedToken;

        if (!email) throw new Error('Email is required');

        // 2. Check if user exists in our Postgres DB
        let user = await prisma.user.findUnique({
            where: { firebaseUid: uid },
        });

        // 3. Create if not exists
        if (!user) {
            user = await prisma.user.create({
                data: {
                    firebaseUid: uid,
                    email: email,
                    name: name || 'User',
                    role: 'EMPLOYEE', // Default role
                },
            });
        }

        return { success: true, user };
    } catch (error) {
        console.error('Error creating user:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error creating user' };
    }
}
