import { ButtonHTMLAttributes } from 'react';

export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-xl border border-transparent bg-plutz-tan px-4 py-2 text-xs font-bold uppercase tracking-widest text-plutz-dark transition duration-150 ease-in-out hover:bg-plutz-tan/90 focus:bg-plutz-tan/90 focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 focus:ring-offset-plutz-dark active:bg-plutz-tan/80 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
