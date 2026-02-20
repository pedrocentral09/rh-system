import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    // Support both naming conventions (with and without _ADMIN_)
    const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
    const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

    let privateKey = privateKeyRaw;
    if (privateKey) {
        // Remove surrounding quotes if present
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.slice(1, -1);
        }
        // Replace literal \n with real newlines
        privateKey = privateKey.replace(/\\n/g, '\n');
    }

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
export const adminStorage = isInitialized ? admin.storage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET) : {
    file: () => ({
        save: async () => { throw new Error('Firebase Admin Storage not initialized'); },
        getSignedUrl: async () => { throw new Error('Firebase Admin Storage not initialized'); }
    })
} as any;
