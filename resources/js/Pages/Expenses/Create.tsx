import React, { FormEventHandler, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';
import FileUpload from '@/Components/FileUpload';
import { useTranslation } from '@/hooks/useTranslation';

export default function Create() {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        invoice_date: new Date().toISOString().split('T')[0],
        amount: '',
        currency: 'EUR',
        company_name: '',
        notes: '',
        status: 'paid',
        attachment: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('expenses.store'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('expenses.new_expense_page')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('expenses.new_expense_page')}</h2>
                    <Link href={route('expenses.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('expenses.back_to_list')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Invoice Details */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('expenses.invoice_details')}</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="invoice_date" value={t('expenses.invoice_date_field')} />
                                        <TextInput
                                            id="invoice_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.invoice_date}
                                            onChange={(e) => setData('invoice_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.invoice_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="company_name" value={t('expenses.company_name')} />
                                        <TextInput
                                            id="company_name"
                                            type="text"
                                            className="mt-1 block w-full"
                                            value={data.company_name}
                                            onChange={(e) => setData('company_name', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.company_name} className="mt-2" />
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
                                    <InputLabel htmlFor="status" value={t('common.status')} />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="paid">{t('expenses.status_paid')}</option>
                                        <option value="unpaid">{t('expenses.status_unpaid')}</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </div>

                            {/* Attachment */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('expenses.attachment')}</h3>
                                <p className="mt-1 text-sm text-stone-400">
                                    {t('expenses.attachment_hint')}
                                </p>
                                
                                <div className="mt-4">
                                    <FileUpload
                                        accept="image/*,application/pdf"
                                        onChange={(file) => setData('attachment', file)}
                                        error={errors.attachment}
                                        capture={true}
                                    />
                                </div>
                            </div>

                            {/* Notes */}
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

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('expenses.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('expenses.create_expense')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
