import { NextResponse } from 'next/server';
import { AFDSyncService } from '@/modules/core/services/AFDSyncService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for large syncs

export async function POST() {
    // Simple API Key auth
    const apiKey = process.env.AFD_SYNC_API_KEY;
    // For now, allow without API key if not configured (dev mode)

    const externalDbUrl = process.env.AFD_DATABASE_URL || process.env.RAILWAY_DB_URL;
    if (!externalDbUrl) {
        return NextResponse.json(
            { error: 'AFD_DATABASE_URL or RAILWAY_DB_URL not configured' },
            { status: 500 }
        );
    }

    try {
        const syncService = new AFDSyncService(externalDbUrl);
        const result = await syncService.sync();

        return NextResponse.json({
            status: result.errors.length > 0 ? 'partial' : 'success',
            ...result
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

// Also support GET for easy browser testing
export async function GET() {
    return POST();
}
