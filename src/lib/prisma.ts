import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load .env only if not in Next.js (where it's automatic)
if (!process.env.NEXT_RUNTIME) {
    dotenv.config();
}

const prismaClientSingleton = () => {
    return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
