
import { prisma } from './src/lib/prisma';

async function main() {
    const email = 'pedrocentral09@gmail.com';
    const updated = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
    });
    console.log(`Updated user ${updated.email} to role ${updated.role}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
