import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    settings: {
        default_locale: string;
    };
}

export default function Language({ settings }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing } = useForm({
        default_locale: settings.default_locale ?? 'en',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.language.update'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('settings.language_page_title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('settings.language_page_title')}</h2>
                    <Link href={route('settings.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('settings.back_to_settings')}</Link>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto w-full p-6">
                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-plutz-cream mb-2">
                            {t('settings.default_language')}
                        </h3>
                        <p className="text-sm text-stone-400 mb-4">
                            {t('settings.default_language_help')}
                        </p>

                        <label className="block text-sm font-medium text-stone-400 mb-2">
                            {t('common.language')}
                        </label>
                        <select
                            value={data.default_locale}
                            onChange={(e) => setData('default_locale', e.target.value)}
                            className="w-full max-w-xs rounded-lg border-stone-700 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                        >
                            <option value="en">English</option>
                            <option value="sl">Slovenščina</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center rounded-lg bg-plutz-tan px-4 py-2 text-xs font-semibold uppercase tracking-widest text-plutz-dark transition duration-150 ease-in-out hover:bg-plutz-tan-light focus:bg-plutz-tan-light focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 active:bg-plutz-tan-light disabled:opacity-50"
                        >
                            {t('settings.save_settings')}
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
