import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Index() {
    const { t } = useTranslation();

    const settingsCards = [
        {
            title: t('settings.email_title'),
            description: t('settings.email_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            href: route('settings.email'),
            current: route().current('settings.email'),
        },
        {
            title: t('settings.contracts_title'),
            description: t('settings.contracts_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: route('settings.contracts'),
            current: route().current('settings.contracts'),
        },
        {
            title: t('settings.templates_title'),
            description: t('settings.templates_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            href: route('contract-templates.index'),
            current: route().current('contract-templates.*'),
        },
        {
            title: t('settings.cost_types_title'),
            description: t('settings.cost_types_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
            href: route('cost-types.index'),
            current: route().current('cost-types.*'),
        },
        {
            title: t('settings.performance_types_title'),
            description: t('settings.performance_types_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
            ),
            href: route('performance-types.index'),
            current: route().current('performance-types.*'),
        },
        {
            title: t('settings.calendar_title'),
            description: t('settings.calendar_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
            href: route('ical-feeds.index'),
            current: route().current('ical-feeds.*'),
        },
        {
            title: t('settings.language_title'),
            description: t('settings.language_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
            ),
            href: route('settings.language'),
            current: route().current('settings.language'),
        },
        {
            title: t('settings.users_title'),
            description: t('settings.users_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ),
            href: route('users.index'),
            current: route().current('users.*'),
        },
        {
            title: t('settings.api_keys_title'),
            description: t('settings.api_keys_description'),
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            href: route('settings.api-keys'),
            current: route().current('settings.api-keys'),
        },
    ];

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('settings.title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('settings.title')}</h2>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {settingsCards.map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className={`block rounded-lg bg-plutz-surface p-6 shadow-sm transition-all hover:border-plutz-tan/30 ${
                                    card.current ? 'ring-2 ring-plutz-tan' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`flex-shrink-0 rounded-lg p-3 ${
                                        card.current ? 'bg-plutz-tan/20 text-plutz-tan' : 'bg-stone-800 text-stone-400'
                                    }`}>
                                        {card.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-plutz-cream">
                                            {card.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-stone-500">
                                            {card.description}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
