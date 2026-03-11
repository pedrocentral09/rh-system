import { NextResponse } from 'next/server';
import { whatsappService } from '@/modules/notifications/services/whatsapp.service';

export async function GET() {
    try {
        const status = whatsappService.getStatus();
        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to get WhatsApp status' }, { status: 500 });
    }
}
