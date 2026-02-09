import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const prisma = new PrismaClient();

async function createAdmin() {
    const email = 'admin@rh.com';
    const password = 'admin-password-2026';
    const name = 'Administrador Sistema';

    console.log(`🚀 Iniciando criação de admin: ${email}...`);

    try {
        // Initialize Admin manually to ensure ENVs are loaded
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                }),
            });
        }

        const auth = admin.auth();

        // 1. Create in Firebase
        let firebaseUid = '';
        try {
            const userRecord = await auth.createUser({
                email,
                password,
                displayName: name,
            });
            firebaseUid = userRecord.uid;
            console.log(`✅ Usuário criado no Firebase (UID: ${firebaseUid})`);
        } catch (e: any) {
            if (e.code === 'auth/email-already-exists') {
                const user = await auth.getUserByEmail(email);
                firebaseUid = user.uid;
                console.log(`ℹ️ Usuário já existe no Firebase (UID: ${firebaseUid})`);
            } else {
                throw e;
            }
        }

        // 2. Sync to Database
        await prisma.user.upsert({
            where: { firebaseUid },
            update: {
                role: 'ADMIN',
                email,
                name
            },
            create: {
                firebaseUid,
                email,
                name,
                role: 'ADMIN'
            }
        });

        console.log('✅ Usuário admin sincronizado no banco de dados local.');
        console.log('\n-----------------------------------');
        console.log(`LOGIN: ${email}`);
        console.log(`SENHA: ${password}`);
        console.log('-----------------------------------\n');

    } catch (error) {
        console.error('❌ Erro fatal ao criar admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
