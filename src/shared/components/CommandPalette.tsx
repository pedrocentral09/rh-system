'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { globalSearch, SearchResult } from '@/modules/core/actions/search';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const router = useRouter();

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setQuery('');
            setResults([]);
            setSelectedIndex(0);
        }
    }, [isOpen]);

    // Search logic
    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const timeoutId = setTimeout(async () => {
            const data = await globalSearch(query);
            setResults(data);
            setSelectedIndex(0);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [query]);

    // Navigation logic
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (results[selectedIndex]) {
                handleSelect(results[selectedIndex]);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };

    const handleSelect = (result: SearchResult) => {
        onClose();
        setQuery('');
        router.push(result.url);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />
                )}
            </AnimatePresence>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative w-full max-w-2xl bg-surface/90 backdrop-blur-2xl border border-border shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden pointer-events-auto"
                    >
                        <div className="flex items-center border-b border-border px-8 py-6 relative">
                            <span className="text-2xl mr-4 opacity-50">🔍</span>
                            <input
                                className="flex-1 bg-transparent outline-none text-text-primary text-lg font-black placeholder:text-text-muted/40 uppercase tracking-tighter"
                                placeholder="QUAL É A SUA PRÓXIMA OPERAÇÃO?..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                            <div className="flex items-center gap-2 text-[9px] font-black text-white bg-brand-orange px-3 py-1.5 rounded-full shadow-lg shadow-brand-orange/20 border-b-2 border-black/20 tracking-widest">
                                <span>ESC</span>
                            </div>
                        </div>

                        {results.length > 0 ? (
                            <ul className="py-4 max-h-[60vh] overflow-y-auto no-scrollbar">
                                {results.map((result, index) => (
                                    <li
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className={cn(
                                            "px-8 py-5 flex items-center gap-6 cursor-pointer transition-all relative overflow-hidden group",
                                            index === selectedIndex
                                                ? "bg-brand-orange/10 text-text-primary"
                                                : "hover:bg-surface-secondary text-text-secondary"
                                        )}
                                    >
                                        {index === selectedIndex && (
                                            <motion.div
                                                layoutId="search-active"
                                                className="absolute left-0 inset-y-0 w-1.5 bg-brand-orange shadow-[0_0_15px_rgba(255,120,0,0.8)]"
                                            />
                                        )}

                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500",
                                            index === selectedIndex ? "bg-brand-orange text-white rotate-6 scale-110 shadow-xl shadow-brand-orange/20" : "bg-surface-secondary grayscale opacity-50"
                                        )}>
                                            {result.icon || '📑'}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "font-black text-sm uppercase tracking-widest transition-colors",
                                                index === selectedIndex ? "text-brand-orange" : "text-text-primary"
                                            )}>{result.title}</p>
                                            {result.subtitle && (
                                                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider opacity-60 mt-0.5 truncate">
                                                    {result.subtitle}
                                                </p>
                                            )}
                                        </div>

                                        {index === selectedIndex && (
                                            <motion.span
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="text-[10px] font-black text-brand-orange uppercase tracking-[0.2em] italic"
                                            >
                                                GO ↵
                                            </motion.span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : query.length > 1 ? (
                            <div className="py-12 text-center text-text-muted">
                                <p className="text-sm font-black uppercase tracking-widest opacity-40 italic">Nenhum rastro encontrado nos sistemas</p>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-[10px] font-black text-brand-orange uppercase tracking-[0.4em] animate-pulse">Sincronizando Índices Corporativos...</p>
                            </div>
                        )}

                        <div className="p-4 bg-surface-secondary border-t border-border flex justify-center gap-6 text-[8px] font-black text-text-muted uppercase tracking-[0.2em]">
                            <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-surface border border-border rounded shadow-sm text-text-primary">↑↓</span> NAVEGAR</div>
                            <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-surface border border-border rounded shadow-sm text-text-primary">↵</span> SELECIONAR</div>
                            <div className="flex items-center gap-1.5"><span className="px-1.5 py-0.5 bg-surface border border-border rounded shadow-sm text-text-primary">ESC</span> FECHAR</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
