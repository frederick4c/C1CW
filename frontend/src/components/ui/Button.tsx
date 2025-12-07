import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    loadingText?: string;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText = 'Loading...',
    className = '',
    children,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0B0F17] disabled:opacity-50 disabled:cursor-not-allowed font-heading tracking-wide active:scale-95';

    const variants = {
        primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-teal-900/20 border border-transparent',
        secondary: 'bg-[var(--surface-highlight)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
        outline: 'bg-transparent border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)]',
        ghost: 'text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--surface-highlight)]',
        danger: 'bg-red-50, text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{loadingText}</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};
