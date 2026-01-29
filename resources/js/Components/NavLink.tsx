import { InertiaLinkProps, Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}: InertiaLinkProps & { active: boolean }) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'border-plutz-tan text-plutz-cream focus:border-plutz-tan'
                    : 'border-transparent text-plutz-cream/60 hover:border-plutz-tan/40 hover:text-plutz-cream focus:border-plutz-tan/40 focus:text-plutz-cream') +
                className
            }
        >
            {children}
        </Link>
    );
}
