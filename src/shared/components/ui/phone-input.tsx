'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import InputMask from 'react-input-mask';

export interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    error?: string;
}

const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <div className="w-full">
                <InputMask
                    mask="(99) 99999-9999"
                    maskChar="_"
                    {...props}
                    inputRef={ref}
                >
                    {(inputProps: any) => (
                        <input
                            {...inputProps}
                            type="text"
                            placeholder="(00) 00000-0000"
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

PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

// Validation helper
export function validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Accept both mobile (11 digits) and landline (10 digits)
    return cleaned.length === 10 || cleaned.length === 11;
}
