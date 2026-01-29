import { InputHTMLAttributes } from 'react';

export default function Checkbox({
    className = '',
    ...props
}: InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-plutz-tan/20 bg-plutz-dark text-plutz-tan shadow-sm focus:ring-plutz-tan ' +
                className
            }
        />
    );
}
