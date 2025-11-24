import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    className = '',
    ...props
}) => {
    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="text-sm font-medium text-[var(--text-secondary)] ml-1">
                    {label}
                </label>
            )}
            <input
                className={`px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all duration-200 ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-[var(--error)] ml-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-[var(--text-tertiary)] ml-1">{helperText}</p>
            )}
        </div>
    );
};
