import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface ContractTemplate {
    id: number;
    name: string;
    markdown: string;
    is_active: boolean;
}

interface Props extends PageProps {
    template: ContractTemplate;
}

export default function Edit({ auth, template }: Props) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        name: template.name,
        markdown: template.markdown,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('contract-templates.update', template.id));
    };

    const handleActivate = () => {
        router.patch(route('contract-templates.activate', template.id));
    };

    const placeholders = [
        { code: '[NAROČNIK]', description: t('templates.placeholder_client') },
        { code: '[EMAIL]', description: t('templates.placeholder_email') },
        { code: '[PODJETJE]', description: t('templates.placeholder_company') },
        { code: '[NASLOV]', description: t('templates.placeholder_address') },
        { code: '[DATUM_NASTOPA]', description: t('templates.placeholder_date') },
        { code: '[SKUPNI_ZNESEK]', description: t('templates.placeholder_total') },
        { code: '[AVANS]', description: t('templates.placeholder_deposit') },
        { code: '[PLUTZ_ADDRESS]', description: t('templates.placeholder_plutz') },
    ];

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('templates.edit_template')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('templates.edit_template')}</h2>
                    <Link href={route('contract-templates.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('templates.back_to_templates')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {template.is_active && (
                        <div className="mb-4 bg-green-500/10 border border-green-500/20 rounded-md p-4">
                            <p className="text-sm text-green-400">
                                {t('templates.active_notice')}
                            </p>
                        </div>
                    )}

                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('templates.template_name')}
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    required
                                />
                                {errors.name && (
                                    <div className="text-red-400 text-sm mt-1">{errors.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('templates.content')}
                                </label>
                                <div className="mb-2 p-3 bg-plutz-tan/10 border border-blue-200 rounded-md">
                                    <p className="text-sm font-medium text-blue-900 mb-2">{t('templates.available_placeholders')}</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-plutz-tan">
                                        {placeholders.map((placeholder) => (
                                            <div key={placeholder.code}>
                                                <code className="bg-plutz-tan/20 px-1 py-0.5 rounded">{placeholder.code}</code>
                                                <span className="ml-2">{placeholder.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={data.markdown}
                                    onChange={(e) => setData('markdown', e.target.value)}
                                    rows={20}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan font-mono text-sm"
                                    required
                                />
                                {errors.markdown && (
                                    <div className="text-red-400 text-sm mt-1">{errors.markdown}</div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('contract-templates.index')}
                                    className="px-4 py-2 bg-plutz-tan/20 text-stone-400 rounded-md hover:bg-plutz-tan/30"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                                >
                                    {processing ? t('contracts.saving') : t('templates.save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
