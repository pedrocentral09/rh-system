'use client';

import { Toaster } from 'sonner';

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            theme="system"
            richColors
            closeButton
            duration={4000}
            expand={false}
            visibleToasts={5}
        />
    );
}
