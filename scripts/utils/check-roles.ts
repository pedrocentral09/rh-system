
import { prisma } from './src/lib/prisma';

async function main() {
    const users = await prisma.user.findMany();
    console.log('Current Users and Roles:');
    console.table(users.map(u => ({ email: u.email, role: u.role, name: u.name })));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
