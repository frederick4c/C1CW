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
        <div className="flex flex-col gap-3">
            {label && (
                <label className="text-sm font-semibold text-foreground">
                    {label}
                </label>
            )}
            <input
                className={`px-5 py-4 rounded-lg border-2 border-[var(--border)] bg-white text-foreground placeholder-foreground-tertiary focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)] focus:ring-opacity-20 transition-all ${error ? 'border-[var(--error)] focus:border-[var(--error)] focus:ring-[var(--error)]' : ''
                    } ${className}`}
                {...props}
            />
            {error && (
                <p className="text-sm text-[var(--error)] mt-1">{error}</p>
            )}
            {helperText && !error && (
                <p className="text-sm text-foreground-secondary mt-1">{helperText}</p>
            )}
        </div>
    );
};
