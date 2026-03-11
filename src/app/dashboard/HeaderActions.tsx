'use client';

import { useState, useEffect } from 'react';
import { CommandPalette } from '@/shared/components/CommandPalette';
import { NotificationCenter } from '@/modules/core/components/NotificationCenter';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { Search, Moon, Sun, Bell, User, Settings } from 'lucide-react';

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
        <div className="flex items-center gap-2">
            {/* Search Trigger */}
            <button
                onClick={() => setIsSearchOpen(true)}
                className="group flex items-center gap-3 px-4 py-2 bg-surface border border-border hover:border-brand-orange/30 hover:shadow-lg hover:shadow-brand-orange/5 transition-all duration-300 rounded-2xl group cursor-pointer"
            >
                <Search className="w-4 h-4 text-text-muted group-hover:text-brand-orange transition-colors" />
                <span className="hidden xl:inline text-xs font-medium text-text-muted group-hover:text-text-primary transition-colors">
                    Pesquisar sistema...
                </span>
                <div className="flex items-center gap-1 ml-4 px-1.5 py-0.5 bg-surface-secondary border border-border rounded-lg text-[10px] font-bold text-text-muted">
                    <span className="opacity-50">⌘</span>
                    <span>K</span>
                </div>
            </button>

            <div className="h-8 w-px bg-border/50 mx-2" />

            <div className="flex items-center gap-1">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange text-text-muted transition-all duration-200 group active:scale-95"
                    title="Alternar Tema"
                >
                    {theme === 'light' ? (
                        <Moon className="w-5 h-5 transition-transform group-hover:-rotate-12" />
                    ) : (
                        <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
                    )}
                </button>

                {/* Notifications */}
                <div className="relative">
                    <NotificationCenter />
                </div>

                {/* Settings Helper */}
                <button
                    className="p-2.5 rounded-xl hover:bg-brand-orange/10 hover:text-brand-orange text-text-muted transition-all duration-200 group active:scale-95"
                    title="Configurações"
                >
                    <Settings className="w-5 h-5 transition-transform group-hover:rotate-90 duration-500" />
                </button>
            </div>

            <div className="h-8 w-px bg-border/50 mx-2" />

            {/* User Profile */}
            <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-2xl hover:bg-surface-secondary transition-all active:scale-95">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-black text-text-primary leading-tight">Administrador</p>
                    <p className="text-[10px] font-medium text-text-muted leading-tight opacity-60">Status: Ativo</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange to-brand-orange/80 p-[1px] shadow-lg shadow-brand-orange/20">
                    <div className="w-full h-full rounded-[11px] bg-surface flex items-center justify-center">
                        <User className="w-5 h-5 text-brand-orange" />
                    </div>
                </div>
            </button>

            <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </div>
    );
}
