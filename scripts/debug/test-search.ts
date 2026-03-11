
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Checking DB connection...");
    const count = await prisma.employee.count();
    console.log(`Total Employees: ${count}`);

    const all = await prisma.employee.findMany({ take: 3 });
    console.log("Sample Employees:", all.map(e => e.name));

    const query = "Pedro"; 
    console.log(`Testing search for '${query}'...`);
    
    // Simulate logic from search.ts
    const results = await prisma.employee.findMany({
        where: {
            OR: [
                { name: { contains: query } }
            ],
            status: 'ACTIVE'
        },
        select: { id: true, name: true }
    });
    console.log("Search Results:", results);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
