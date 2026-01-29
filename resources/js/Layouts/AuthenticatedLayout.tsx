import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
    className,
}: PropsWithChildren<{ header?: ReactNode; className?: string }>) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className={`min-h-screen ${className || 'bg-plutz-cream'}`}>
            <nav className="bg-plutz-dark shadow-warm-md">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/">
                                    <img 
                                        src="/images/logo-plutz-25.svg" 
                                        alt="Plutz Logo" 
                                        className="h-9 w-auto" 
                                    />
                                </Link>
                            </div>

                            <div className="hidden space-x-6 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                                <NavLink
                                    href={route('inquiries.index')}
                                    active={route().current('inquiries.*')}
                                >
                                    Inquiries
                                </NavLink>
                                <NavLink
                                    href={route('calendar.index')}
                                    active={route().current('calendar.*')}
                                >
                                    Calendar
                                </NavLink>
                                <NavLink
                                    href={route('incomes.index')}
                                    active={route().current('incomes.*')}
                                >
                                    Income
                                </NavLink>
                                <NavLink
                                    href={route('expenses.index')}
                                    active={route().current('expenses.*')}
                                >
                                    Expenses
                                </NavLink>
                                <NavLink
                                    href={route('group-costs.index')}
                                    active={route().current('group-costs.*')}
                                >
                                    Group Costs
                                </NavLink>
                                <NavLink
                                    href={route('contracts.index')}
                                    active={route().current('contracts.*')}
                                >
                                    Contracts
                                </NavLink>
                                <NavLink
                                    href={route('users.index')}
                                    active={route().current('users.*')}
                                >
                                    Users
                                </NavLink>
                                <NavLink
                                    href={route('settings.index')}
                                    active={route().current('settings.*') || route().current('ical-feeds.*') || route().current('cost-types.*') || route().current('performance-types.*') || route().current('contract-templates.*')}
                                >
                                    Settings
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-lg border border-plutz-accent-light/30 bg-plutz-brown/50 px-3 py-2 text-sm font-medium leading-4 text-plutz-cream transition duration-150 ease-in-out hover:bg-plutz-brown/70 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-lg p-2 text-plutz-cream/70 transition duration-150 ease-in-out hover:bg-plutz-brown/50 hover:text-plutz-cream focus:bg-plutz-brown/50 focus:text-plutz-cream focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('inquiries.index')}
                            active={route().current('inquiries.*')}
                        >
                            Inquiries
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('calendar.index')}
                            active={route().current('calendar.*')}
                        >
                            Calendar
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('incomes.index')}
                            active={route().current('incomes.*')}
                        >
                            Income
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('expenses.index')}
                            active={route().current('expenses.*')}
                        >
                            Expenses
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('group-costs.index')}
                            active={route().current('group-costs.*')}
                        >
                            Group Costs
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('contracts.index')}
                            active={route().current('contracts.*')}
                        >
                            Contracts
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('users.index')}
                            active={route().current('users.*')}
                        >
                            Users
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('settings.index')}
                            active={route().current('settings.*') || route().current('ical-feeds.*') || route().current('cost-types.*') || route().current('performance-types.*') || route().current('contract-templates.*')}
                        >
                            Settings
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-plutz-brown/30 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-plutz-cream">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-plutz-cream/60">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-warm">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
