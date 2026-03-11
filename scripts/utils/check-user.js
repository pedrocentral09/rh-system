require('dotenv').config();
// process.env.DATABASE_URL = process.env.RAILWAY_DB_URL; // Commented out to check local DB

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'dpessoal@centralgestora.com.br';
    console.log('Listing all users...');

    const users = await prisma.user.findMany({
        include: {
            roleDef: true
        }
    });

    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
        console.log(`- ${u.email} (Role: ${u.role}, RoleID: ${u.roleId}, RoleDef: ${u.roleDef?.name})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
