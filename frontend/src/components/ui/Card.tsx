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
    return (
        <div
            className={`glass-panel rounded-2xl p-8 transition-all duration-300 hover:border-[var(--primary)]/30 hover:shadow-xl hover:shadow-teal-900/5 ${className}`}
            {...props}
        >
            {(title || description) && (
                <div className="mb-6">
                    {title && (
                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-heading tracking-tight">
                            {title}
                        </h3>
                    )}
                    {description && (
                        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};
