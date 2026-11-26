import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SigningExpired() {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-plutz-dark p-4">
            <Head title={t('signing.expired_title')} />
            <img src="/images/logo-plutz-25.svg" alt="Plutz" className="mb-6 h-12 w-auto sm:h-14" />
            <div className="w-full max-w-md rounded-2xl bg-plutz-surface p-6 text-center shadow-2xl ring-1 ring-plutz-tan/10 sm:p-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-plutz-tan/10">
                    <svg className="h-9 w-9 text-plutz-tan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6l4 2m5-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="mb-3 font-serif text-2xl font-bold text-plutz-cream">{t('signing.expired_title')}</h1>
                <p className="mb-5 text-stone-400">{t('signing.expired_message')}</p>
                <p className="border-t border-plutz-tan/10 pt-5 text-sm text-stone-500">{t('signing.expired_support')}</p>
            </div>
        </div>
    );
}
