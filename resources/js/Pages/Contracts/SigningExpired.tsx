import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function SigningExpired() {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-plutz-dark flex items-center justify-center p-4">
            <Head title={t('signing.expired_title')} />
            <div className="max-w-md w-full bg-plutz-surface shadow-lg rounded-lg p-8 text-center">
                <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-plutz-cream mb-2">{t('signing.expired_title')}</h1>
                <p className="text-stone-400 mb-6">
                    {t('signing.expired_message')}
                </p>
                <p className="text-sm text-stone-500">
                    {t('signing.expired_support')}
                </p>
            </div>
        </div>
    );
}
