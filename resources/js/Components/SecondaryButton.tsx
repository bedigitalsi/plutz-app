import { ButtonHTMLAttributes } from 'react';

export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center rounded-xl border border-plutz-tan/20 bg-plutz-tan/20 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-plutz-tan shadow-sm transition duration-150 ease-in-out hover:bg-plutz-tan/30 focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 focus:ring-offset-plutz-dark disabled:opacity-25 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
