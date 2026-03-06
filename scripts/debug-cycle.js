const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const cycle = await prisma.evaluationCycle.findUnique({
        where: { id: '13282a2a-cac0-473e-9ee5-596783b27a7a' },
        include: {
            reviews: {
                include: {
                    evaluator: { select: { id: true, name: true } },
                    evaluated: { select: { id: true, name: true } },
                },
            }
        }
    });
    console.log(cycle);
}

main().catch(console.error).finally(() => prisma.$disconnect());
