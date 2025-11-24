import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
    title,
    description,
    children,
    className = '',
    variant = 'default',
    ...props
}) => {
    const baseStyles = 'rounded-lg p-8 transition-all duration-200';
    const variants = {
        default: 'bg-white border border-[var(--border)] hover:shadow-md',
        outlined: 'bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--border-hover)]',
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <h3 className="text-xl font-bold text-foreground mb-3">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-foreground-secondary text-sm">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
