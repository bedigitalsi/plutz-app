import { usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

export function useTranslation() {
    const { locale, translations } = usePage<PageProps>().props;

    /**
     * Translate a key, with optional replacements.
     * Falls back to the key itself if no translation is found.
     *
     * Usage:
     *   t('nav.dashboard')           → "Dashboard" or "Nadzorna plošča"
     *   t('greeting', { name: 'John' }) → replaces :name in the translation string
     */
    function t(key: string, replacements?: Record<string, string>): string {
        let value = translations?.[key] ?? key;

        if (replacements) {
            Object.entries(replacements).forEach(([k, v]) => {
                value = value.replace(`:${k}`, v);
            });
        }

        return value;
    }

    return { t, locale: locale ?? 'en' };
}
