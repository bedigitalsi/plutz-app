import React, { FormEventHandler, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';
import { useTranslation } from '@/hooks/useTranslation';

interface PerformanceType {
    id: number;
    name: string;
}

interface Inquiry {
    id: number;
    location_name: string;
    contact_person: string;
    price_amount: number;
    currency: string;
    performance_date: string;
    performance_type_id: number;
}

interface Props {
    performanceTypes: PerformanceType[];
    inquiry?: Inquiry;
}

export default function Create({ performanceTypes, inquiry }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        income_date: inquiry?.performance_date || '',
        amount: inquiry?.price_amount?.toString() || '',
        currency: inquiry?.currency || 'EUR',
        invoice_issued: false,
        performance_type_id: inquiry?.performance_type_id?.toString() || '',
        contact_person: inquiry?.contact_person || '',
        notes: '',
        inquiry_id: inquiry?.id?.toString() || '',
    });

    useEffect(() => {
        if (inquiry) {
            setData({
                ...data,
                income_date: inquiry.performance_date,
                amount: inquiry.price_amount?.toString() || '',
                currency: inquiry.currency,
                performance_type_id: inquiry.performance_type_id?.toString(),
                contact_person: inquiry.contact_person,
                inquiry_id: inquiry.id.toString(),
            });
        }
    }, [inquiry]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('incomes.store'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('incomes.new_income_page')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('incomes.new_income_page')}</h2>
                    <Link href={route('incomes.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('incomes.back_to_list')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {inquiry && (
                        <div className="mb-6 rounded-lg bg-plutz-tan/10 p-4">
                            <p className="text-sm text-plutz-tan">
                                <strong>{t('incomes.creating_from_inquiry')}</strong> {inquiry.location_name}
                            </p>
                        </div>
                    )}

                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('incomes.income_details')}</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="income_date" value={t('incomes.income_date')} />
                                        <TextInput
                                            id="income_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.income_date}
                                            onChange={(e) => setData('income_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.income_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="performance_type_id" value={t('incomes.performance_type') + ' *'} />
                                        <select
                                            id="performance_type_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.performance_type_id}
                                            onChange={(e) => setData('performance_type_id', e.target.value)}
                                            required
                                        >
                                            <option value="">{t('incomes.select_type')}</option>
                                            {performanceTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.performance_type_id} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <MoneyInput
                                        label={t('common.amount')}
                                        value={data.amount}
                                        onChange={(value) => setData('amount', value)}
                                        currency={data.currency}
                                        error={errors.amount}
                                        required
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="contact_person" value={t('incomes.contact_person')} />
                                    <TextInput
                                        id="contact_person"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_person} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.invoice_issued}
                                            onChange={(e) => setData('invoice_issued', e.target.checked)}
                                            className="rounded border-plutz-tan/20 text-plutz-tan shadow-sm focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">{t('incomes.invoice_issued_checkbox')}</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value={t('common.notes')} />
                                <textarea
                                    id="notes"
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('incomes.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('incomes.create_income')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
