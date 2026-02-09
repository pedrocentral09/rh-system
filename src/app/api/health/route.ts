import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Railway
 * Used to verify the application is running correctly
 */
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'hr-system',
        version: '1.0.0'
    });
}
