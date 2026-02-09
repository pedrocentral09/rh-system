import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (!process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        console.error('❌ FATAL: FIREBASE_ADMIN_PRIVATE_KEY is missing!');
    } else {
        console.log('✅ Firebase Admin Key found (length:', process.env.FIREBASE_ADMIN_PRIVATE_KEY.length, ')');
    }

    // Tratamento robusto para chave privada
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
        console.log('✅ Firebase Admin Initialized Successfully');
    } catch (error) {
        console.error('❌ Error initializing Firebase Admin:', error);
    }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore(); // Just in case we need it, but we prefer Postgres
