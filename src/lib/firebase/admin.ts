import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY
        ? process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log('✅ Firebase Admin Initialized Successfully');
        } catch (error) {
            console.error('❌ Error initializing Firebase Admin:', error);
        }
    } else {
        console.warn('⚠️ Firebase Admin credentials missing. Admin SDK not initialized. Using mocks.');
    }
}

// Safe export that doesn't crash if initialization failed
const isInitialized = admin.apps.length > 0;

export const adminAuth = isInitialized ? admin.auth() : {
    verifyIdToken: async () => { throw new Error('Firebase Admin not initialized (Missing Credentials)'); },
    getUser: async () => { throw new Error('Firebase Admin not initialized (Missing Credentials)'); }
} as any;

export const adminDb = isInitialized ? admin.firestore() : {} as any;
