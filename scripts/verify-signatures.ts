import { signDocument } from '../src/modules/personnel/actions/signatures';
import { prisma } from '../src/lib/prisma';

async function verifySignatures() {
    console.log('--- Verifying Signature Logic ---');

    // 1. Create a dummy document if none exists
    let doc = await prisma.document.findFirst();
    if (!doc) {
        console.log('No documents found to test. Skipping.');
        return;
    }

    console.log(`Testing signature on doc: ${doc.id}`);
    const result = await signDocument(doc.id, '123456', '127.0.0.1');

    if (result.success) {
        console.log('✅ Signature successfully generated!');
        console.log(`Hash: ${result.hash}`);

        // Verify in DB
        const updatedDoc = await prisma.document.findUnique({ where: { id: doc.id } });
        if (updatedDoc?.status === 'SIGNED' && updatedDoc.signatureHash === result.hash) {
            console.log('✅ Database verification passed!');
        } else {
            console.log('❌ Database verification failed.');
        }
    } else {
        console.log(`❌ Signature failed: ${result.error}`);
    }
}

verifySignatures()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
