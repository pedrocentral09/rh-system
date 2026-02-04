'use server';

import { prisma } from '@/lib/prisma';
import { adminAuth } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';
import { logAction } from './audit';
import { z } from 'zod';

const CreateUserSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.string()
});

export async function createSystemUser(data: z.infer<typeof CreateUserSchema>) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return { success: false, error: 'Acesso negado. Apenas administradores podem criar usuários.' };
        }

        const validData = CreateUserSchema.parse(data);

        // 1. Create in Firebase Auth
        let firebaseUid = '';
        try {
            const userRecord = await adminAuth.createUser({
                email: validData.email,
                password: validData.password,
                displayName: validData.name,
            });
            firebaseUid = userRecord.uid;
        } catch (firebaseError: any) {
            if (firebaseError.code === 'auth/email-already-exists') {
                // If exists in Firebase, try to find by email to sync
                const existingUser = await adminAuth.getUserByEmail(validData.email);
                firebaseUid = existingUser.uid;
            } else {
                throw firebaseError;
            }
        }

        // 2. Create in Database
        const newUser = await prisma.user.create({
            data: {
                firebaseUid,
                email: validData.email,
                name: validData.name,
                role: validData.role,
            }
        });

        await logAction('CREATE_USER', 'User', { newUserId: newUser.id, email: newUser.email }, currentUser.id);

        revalidatePath('/dashboard/configuration');
        return { success: true };

    } catch (error: any) {
        console.error('Error creating system user:', error);
        return { success: false, error: error.message || 'Falha ao criar usuário.' };
    }
}
