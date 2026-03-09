'use client';

import { useState, useEffect } from 'react';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { NotificationCenter } from '@/modules/core/components/NotificationCenter';
import { useTheme } from '@/shared/providers/ThemeProvider';

export function HeaderActions({ stats }: { stats: any }) {
    const { theme, toggleTheme } = useTheme();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    // Global Hotkey
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="flex items-center space-x-4">
            {/* Search Trigger */}
            <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-surface-secondary text-text-muted rounded-md hover:brightness-95 transition-colors text-sm"
            >
                <span>🔍 Buscar...</span>
                <span className="text-xs bg-surface px-1.5 rounded border border-border">⌘K</span>
            </button>
            <button
                onClick={() => setIsSearchOpen(true)}
                className="md:hidden text-xl p-2"
            >
                🔍
            </button>

            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-surface-secondary transition-colors"
                title="Alternar Tema"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Notifications */}
            <NotificationCenter />

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center text-brand-blue font-bold ml-2">
                PC
            </div>
        </div>
    );
}
