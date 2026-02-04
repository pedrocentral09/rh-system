'use client';

import { useState, useEffect } from 'react';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { NotificationsPopover } from '@/shared/components/NotificationsPopover';
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
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md hover:bg-slate-200 transition-colors text-sm"
            >
                <span>🔍 Buscar...</span>
                <span className="text-xs bg-white dark:bg-slate-700 px-1.5 rounded border border-slate-200 dark:border-slate-600">⌘K</span>
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
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Alternar Tema"
            >
                {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {/* Notifications */}
            <NotificationsPopover stats={stats} />

            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold ml-2">
                PC
            </div>
        </div>
    );
}
