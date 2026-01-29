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
                    ? 'border-plutz-teal bg-plutz-teal/10 text-plutz-cream focus:border-plutz-teal focus:bg-plutz-teal/20 focus:text-plutz-cream'
                    : 'border-transparent text-plutz-cream/60 hover:border-plutz-cream/30 hover:bg-plutz-brown/30 hover:text-plutz-cream focus:border-plutz-cream/30 focus:bg-plutz-brown/30 focus:text-plutz-cream'
            } text-base font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
