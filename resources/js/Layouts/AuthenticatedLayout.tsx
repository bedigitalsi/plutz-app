import Dropdown from '@/Components/Dropdown';
import { useTranslation } from '@/hooks/useTranslation';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, ReactNode, useState } from 'react';

export default function Authenticated({
    header,
    children,
    className,
}: PropsWithChildren<{ header?: ReactNode; className?: string }>) {
    const { auth } = usePage().props;
    const user = auth.user;
    const permissions: string[] = (auth as any).permissions ?? [];
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const can = (permission: string) => permissions.includes(permission);

    const allNavLinks = [
        { label: t('nav.dashboard'), route: 'dashboard', match: 'dashboard' },
        { label: t('nav.calendar'), route: 'calendar.index', match: 'calendar.*', permission: 'inquiries.view' },
        { label: t('nav.income'), route: 'incomes.index', match: 'incomes.*', permission: 'income.view' },
        { label: t('nav.group_costs'), route: 'group-costs.index', match: 'group-costs.*', permission: 'group_costs.view' },
        { label: t('nav.expenses'), route: 'expenses.index', match: 'expenses.*', permission: 'expenses.view' },
        { label: t('nav.inquiries'), route: 'inquiries.index', match: 'inquiries.*', permission: 'inquiries.view' },
        { label: t('nav.contracts'), route: 'contracts.index', match: 'contracts.*', permission: 'contracts.manage' },
        { label: t('nav.settings'), route: 'settings.index', match: ['settings.*', 'ical-feeds.*', 'cost-types.*', 'performance-types.*', 'contract-templates.*', 'users.*'], permission: 'settings.manage' },
    ];

    const navLinks = allNavLinks.filter(link => !link.permission || can(link.permission));

    const isActive = (match: string | string[]) => {
        if (Array.isArray(match)) return match.some(m => route().current(m));
        return route().current(match);
    };

    return (
        <div className={`min-h-screen ${className || 'bg-plutz-dark'}`}>
            {/* Top Navigation */}
            <header className="border-b border-plutz-tan/20 bg-plutz-dark/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href={route('dashboard')}>
                            <img src="/images/logo-plutz-25.svg" alt="Plutz Logo" className="h-9 w-auto" />
                        </Link>
                    </div>

                    {/* Desktop Nav */}
                    <div className="flex items-center gap-6">
                        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium uppercase tracking-widest text-stone-500">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.route}
                                    href={route(link.route)}
                                    className={`hover:text-plutz-tan transition-colors ${
                                        isActive(link.match) 
                                            ? 'text-plutz-tan border-b-2 border-plutz-tan pb-1' 
                                            : ''
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Right side: notification + avatar */}
                        <div className="flex items-center gap-3 pl-6 border-l border-plutz-tan/20">
                            {/* User dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="flex items-center gap-2 text-stone-400 hover:text-plutz-tan transition-colors">
                                            <div className="size-10 rounded-full border-2 border-plutz-tan p-0.5 overflow-hidden flex items-center justify-center bg-plutz-surface">
                                                <span className="text-sm font-semibold text-plutz-tan">
                                                    {user.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                                </span>
                                            </div>
                                        </button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-plutz-tan/10">
                                            <p className="text-sm font-medium text-plutz-cream">{user.name}</p>
                                            <p className="text-xs text-stone-500">{user.email}</p>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>{t('nav.profile')}</Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button">{t('nav.logout')}</Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-stone-400 hover:text-plutz-tan transition-colors"
                        >
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                {!mobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-plutz-tan/10 bg-plutz-dark">
                        <div className="px-6 py-4 space-y-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.route}
                                    href={route(link.route)}
                                    className={`block py-2 text-sm font-medium uppercase tracking-widest transition-colors ${
                                        isActive(link.match) ? 'text-plutz-tan' : 'text-stone-500 hover:text-plutz-tan'
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </header>

            {header && (
                <div className="bg-plutz-surface border-b border-plutz-tan/10">
                    <div className="mx-auto max-w-[1200px] px-6 py-6">
                        {header}
                    </div>
                </div>
            )}

            <main>{children}</main>
        </div>
    );
}
