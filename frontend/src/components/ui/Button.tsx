import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    children,
    disabled,
    ...props
}) => {
    // CRITICAL: Using !important to override any conflicting styles
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap';

    const variants = {
        primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)] focus:ring-[var(--primary)]',
        secondary: 'bg-[var(--accent)] text-white hover:opacity-90 focus:ring-[var(--accent)]',
        outline: 'border-2 border-[var(--border)] text-foreground hover:border-[var(--border-hover)] hover:bg-[var(--background-secondary)]',
        ghost: 'text-foreground hover:bg-[var(--background-secondary)]',
        danger: 'bg-[var(--error)] text-white hover:opacity-90 focus:ring-[var(--error)]',
    };

    // MASSIVE padding - text should have tons of space
    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    // Inline style to force padding (overrides everything)
    const paddingStyle = {
        paddingLeft: size === 'sm' ? '32px' : size === 'lg' ? '64px' : '48px',
        paddingRight: size === 'sm' ? '32px' : size === 'lg' ? '64px' : '48px',
        paddingTop: size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px',
        paddingBottom: size === 'sm' ? '12px' : size === 'lg' ? '20px' : '16px',
        minWidth: size === 'sm' ? '120px' : size === 'lg' ? '180px' : '150px',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            style={paddingStyle}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                </>
            ) : (
                children
            )}
        </button>
    );
};
