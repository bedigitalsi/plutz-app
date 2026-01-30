import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
    settings: {
        plutz_address: string;
    };
}

export default function Contracts({ settings }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        plutz_address: settings.plutz_address ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.contracts.update'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('settings.contracts_page_title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('settings.contracts_page_title')}</h2>
                    <Link href={route('settings.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('settings.back_to_settings')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-2">
                                {t('settings.plutz_address')}
                            </h3>
                            <p className="text-sm text-stone-400 mb-4">
                                {t('settings.plutz_address_help')}
                            </p>

                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                {t('settings.address_label')}
                            </label>
                            <textarea
                                value={data.plutz_address}
                                onChange={(e) => setData('plutz_address', e.target.value)}
                                rows={5}
                                className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                placeholder={t('settings.address_placeholder')}
                            />
                            {errors.plutz_address && (
                                <div className="text-red-400 text-sm mt-1">{errors.plutz_address}</div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                            >
                                {processing ? t('common.loading') : t('settings.save_settings')}
                            </button>
                        </div>
                    </form>
                </div>
        </AuthenticatedLayout>
    );
}

