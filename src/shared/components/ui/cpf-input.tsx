'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import InputMask from 'react-input-mask';

export interface CPFInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
}

const CPFInput = forwardRef<HTMLInputElement, CPFInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <InputMask
                    mask="999.999.999-99"
                    {...props}
                    inputRef={ref}
                >
                    {(inputProps: any) => (
                        <input
                            {...inputProps}
                            type="text"
                            className={`flex h-10 w-full rounded-md border ${error ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                } bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
                        />
                    )}
                </InputMask>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        );
    }
);

CPFInput.displayName = 'CPFInput';

export { CPFInput };

// Validation helper
export function validateCPF(cpf: string): boolean {
    cpf = cpf.replace(/\D/g, '');

    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}
