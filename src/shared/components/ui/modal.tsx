'use client';

import { useEffect, useRef } from 'react';
import { Button } from './button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full';
    hideHeader?: boolean;
}

export function Modal({ isOpen, onClose, title, children, width = 'md', hideHeader = false }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const widthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        'full': 'max-w-full mx-4',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 md:p-4 animate-in fade-in duration-200">
            <div
                ref={modalRef}
                className={`bg-surface rounded-2xl shadow-2xl w-full ${widthClasses[width]} max-h-[95vh] md:max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-border overflow-hidden relative`}
                role="dialog"
                aria-modal="true"
            >
                {!hideHeader && (
                    <div className="relative flex items-center justify-center p-6 border-b border-border">
                        <h2 className="text-xl font-bold text-text-primary uppercase tracking-tight">{title}</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="absolute right-6 h-8 w-8 p-0 rounded-full hover:bg-surface-secondary text-text-muted hover:text-text-primary"
                        >
                            ✕
                        </Button>
                    </div>
                )}

                {hideHeader && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="absolute right-10 top-10 h-10 w-10 p-0 rounded-2xl bg-surface-secondary/90 border border-border hover:bg-surface-hover text-text-primary z-[60] backdrop-blur-md transition-all active:scale-95 shadow-sm"
                    >
                        ✕
                    </Button>
                )}

                <div className={`flex-1 overflow-y-auto ${hideHeader ? 'p-0' : 'p-6'}`}>
                    {children}
                </div>
            </div>
        </div>
    );
}
