import { NextResponse } from 'next/server';
import { AFDSyncService } from '@/modules/core/services/AFDSyncService';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60s for large syncs

export async function POST(req: Request) {
    const apiKey = process.env.AFD_SYNC_API_KEY;
    const authHeader = req.headers.get('Authorization');

    // Auth check if enabled
    if (apiKey && authHeader !== `Bearer ${apiKey}` && req.headers.get('x-api-key') !== apiKey) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { punches, terminal } = body;

        if (!Array.isArray(punches)) {
            return NextResponse.json({ error: 'Invalid payload: "punches" must be an array' }, { status: 400 });
        }

        const syncService = new AFDSyncService();
        const result = await syncService.syncWebhook(punches, terminal || 'Terminal Webhook');

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
