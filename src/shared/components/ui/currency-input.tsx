'use client';

import { forwardRef, InputHTMLAttributes, useState } from 'react';

export interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
    error?: string;
    onValueChange?: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
    ({ className, error, onValueChange, value, ...props }, ref) => {
        const [displayValue, setDisplayValue] = useState(() => {
            if (value) {
                const num = typeof value === 'string' ? parseFloat(value) : value;
                return formatCurrency(num);
            }
            return '';
        });

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;
            const numbers = input.replace(/\D/g, '');

            if (numbers === '') {
                setDisplayValue('');
                onValueChange?.(0);
                return;
            }

            const numericValue = parseInt(numbers) / 100;
            setDisplayValue(formatCurrency(numericValue));
            onValueChange?.(numericValue);
        };

        return (
            <div className="w-full">
                <input
                    {...props}
                    ref={ref}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                    className={`flex h-10 w-full rounded-md border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                        } bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };

// Helper function
function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Parse helper for form submission
export function parseCurrency(currencyString: string): number {
    const numbers = currencyString.replace(/\D/g, '');
    return numbers ? parseInt(numbers) / 100 : 0;
}
