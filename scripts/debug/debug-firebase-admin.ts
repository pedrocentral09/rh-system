import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function debugFirebase() {
    console.log('--- Debugging Firebase Admin SDK ---');

    try {
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
        const listUsersResult = await auth.listUsers(100);
        console.log('Total users in Firebase:', listUsersResult.users.length);

        listUsersResult.users.forEach(user => {
            console.log(`- ${user.email} (UID: ${user.uid})`);
        });

        const adminEmail = 'admin@rh.com';
        const exists = listUsersResult.users.some(u => u.email === adminEmail);
        if (exists) {
            console.log(`✅ User ${adminEmail} exists in Firebase.`);
        } else {
            console.log(`❌ User ${adminEmail} DOES NOT exist in Firebase.`);
        }

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

debugFirebase();
