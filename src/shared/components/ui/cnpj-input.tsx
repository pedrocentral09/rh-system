'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import InputMask from 'react-input-mask';

export interface CNPJInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
}

const CNPJInput = forwardRef<HTMLInputElement, CNPJInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <InputMask
                    mask="99.999.999/9999-99"
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

CNPJInput.displayName = 'CNPJInput';

export { CNPJInput };

// Validation helper
export function validateCNPJ(cnpj: string): boolean {
    cnpj = cnpj.replace(/\D/g, '');

    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

    let length = cnpj.length - 2;
    let numbers = cnpj.substring(0, length);
    const digits = cnpj.substring(length);
    let sum = 0;
    let pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    length = length + 1;
    numbers = cnpj.substring(0, length);
    sum = 0;
    pos = length - 7;

    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
}
