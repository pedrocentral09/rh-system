import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils'; // We need to create this util first or inline it

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-2xl font-black uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange disabled:pointer-events-none disabled:opacity-50 active:scale-95 text-[10px]';

    const variants = {
        primary: 'bg-brand-orange text-white hover:bg-orange-600 shadow-xl shadow-brand-orange/20 border-b-4 border-black/20',
        secondary: 'bg-brand-blue text-white hover:bg-[#071539] shadow-xl shadow-brand-blue/20 border-b-4 border-black/20',
        outline: 'border border-border bg-surface hover:bg-surface-secondary text-text-primary shadow-sm hover:border-brand-orange/30',
        ghost: 'hover:bg-surface-secondary text-text-muted hover:text-text-primary',
        destructive: 'bg-rose-500 text-white hover:bg-rose-600 shadow-xl shadow-rose-500/20 border-b-4 border-black/20',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2 text-sm',
        lg: 'h-12 px-8 text-base',
        icon: 'h-9 w-9 p-0',
    };

    return (
        <button
            ref={ref}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        />
    );
});
Button.displayName = 'Button';

export { Button };
