import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Contract {
    id: number;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_address: string | null;
    performance_date: string;
    total_price: string;
    deposit_amount: string | null;
    currency: string;
    markdown_snapshot: string;
}

interface Props extends PageProps {
    contract: Contract;
}

export default function Edit({ auth, contract }: Props) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        client_name: contract.client_name,
        client_email: contract.client_email,
        client_company: contract.client_company || '',
        client_address: contract.client_address || '',
        performance_date: contract.performance_date,
        total_price: contract.total_price,
        deposit_amount: contract.deposit_amount || '',
        currency: contract.currency,
        markdown_snapshot: contract.markdown_snapshot,
    });

    const [showPreview, setShowPreview] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('contracts.update', contract.id));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('contracts.edit_contract')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('contracts.edit_contract')}</h2>
                    <Link href={route('contracts.show', contract.id)} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('contracts.back_to_contract')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Client Information */}
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.client_information')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.client_name_field')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.client_name && (
                                            <div className="text-red-400 text-sm mt-1">{errors.client_name}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.client_email_field')}
                                        </label>
                                        <input
                                            type="email"
                                            value={data.client_email}
                                            onChange={(e) => setData('client_email', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.client_email && (
                                            <div className="text-red-400 text-sm mt-1">{errors.client_email}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.company_optional')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_company}
                                            onChange={(e) => setData('client_company', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.performance_date_field')}
                                        </label>
                                        <input
                                            type="date"
                                            value={data.performance_date}
                                            onChange={(e) => setData('performance_date', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.performance_date && (
                                            <div className="text-red-400 text-sm mt-1">{errors.performance_date}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        {t('contracts.address_optional')}
                                    </label>
                                    <textarea
                                        value={data.client_address}
                                        onChange={(e) => setData('client_address', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.financial_details')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.total_price_field')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.total_price}
                                            onChange={(e) => setData('total_price', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.total_price && (
                                            <div className="text-red-400 text-sm mt-1">{errors.total_price}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.deposit_amount')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.deposit_amount}
                                            onChange={(e) => setData('deposit_amount', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.currency')}
                                        </label>
                                        <select
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        >
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contract Content */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-plutz-cream">{t('contracts.contract_content')}</h3>
                                    <button
                                        type="button"
                                        onClick={() => setShowPreview(!showPreview)}
                                        className="text-sm text-plutz-tan hover:text-plutz-tan"
                                    >
                                        {showPreview ? t('contracts.hide_preview') : t('contracts.show_preview')}
                                    </button>
                                </div>

                                <div className="text-sm text-stone-400 mb-2">
                                    {t('contracts.placeholders_hint')} [NAROČNIK], [EMAIL], [PODJETJE], [NASLOV], [DATUM_NASTOPA], [SKUPNI_ZNESEK], [AVANS]
                                </div>

                                <textarea
                                    value={data.markdown_snapshot}
                                    onChange={(e) => setData('markdown_snapshot', e.target.value)}
                                    rows={15}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan font-mono text-sm"
                                    required
                                />
                                {errors.markdown_snapshot && (
                                    <div className="text-red-400 text-sm mt-1">{errors.markdown_snapshot}</div>
                                )}

                                {showPreview && (
                                    <div className="mt-4 p-4 border border-plutz-tan/20 rounded-md bg-stone-900/50">
                                        <h4 className="font-medium mb-2">{t('contracts.preview')}</h4>
                                        <div className="prose max-w-none">
                                            {data.markdown_snapshot.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('contracts.show', contract.id)}
                                    className="px-4 py-2 bg-plutz-tan/20 text-stone-400 rounded-md hover:bg-plutz-tan/30"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                                >
                                    {processing ? t('contracts.saving') : t('contracts.save_changes')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
