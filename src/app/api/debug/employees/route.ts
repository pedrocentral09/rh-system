
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const employees = await prisma.employee.findMany(); // Simplest query possible first

        // Try the Complex Query as well to debug Relation issues
        const complexEmployees = await prisma.employee.findMany({
            include: { contract: { include: { store: true, company: true } } }
        });

        const activeCount = await prisma.employee.count({ where: { status: 'ACTIVE' } });

        return NextResponse.json({
            status: 'ok',
            count: employees.length,
            activeCount: activeCount,
            simple: employees,
            complex: complexEmployees // Serializes to JSON automatically via NextResponse
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message, stack: error.stack }, { status: 500 });
    }
}
