import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active?: boolean }) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start border-l-4 py-2 pe-4 ps-3 ${
                active
                    ? 'border-plutz-tan bg-plutz-tan/10 text-plutz-cream focus:border-plutz-tan focus:bg-plutz-tan/20 focus:text-plutz-cream'
                    : 'border-transparent text-plutz-cream/60 hover:border-plutz-tan/30 hover:bg-plutz-tan/10 hover:text-plutz-cream focus:border-plutz-tan/30 focus:bg-plutz-tan/10 focus:text-plutz-cream'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
