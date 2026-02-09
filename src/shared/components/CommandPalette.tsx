'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { globalSearch, SearchResult } from '@/modules/core/actions/search';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
                <div className="flex items-center border-b border-slate-100 px-4 py-3">
                    <span className="text-slate-400 mr-3">🔍</span>
                    <input
                        className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                        placeholder="Buscar funcionário ou página..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                    <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                        <span>ESC</span>
                    </div>
                </div>

                {results.length > 0 ? (
                    <ul className="py-2 max-h-[60vh] overflow-y-auto">
                        {results.map((result, index) => (
                            <li
                                key={result.id}
                                onClick={() => handleSelect(result)}
                                className={`px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors ${index === selectedIndex ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                            >
                                <span className="text-lg opacity-80">{result.icon || '📄'}</span>
                                <div>
                                    <p className="font-medium text-sm">{result.title}</p>
                                    {result.subtitle && <p className="text-xs opacity-70">{result.subtitle}</p>}
                                </div>
                                {index === selectedIndex && (
                                    <span className="ml-auto text-xs text-indigo-400">↵ Enter</span>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : query.length > 1 ? (
                    <div className="py-8 text-center text-slate-500 text-sm">
                        Nenhum resultado encontrado.
                    </div>
                ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                        Digite para buscar...
                    </div>
                )}
            </div>
        </div>
    );
}
