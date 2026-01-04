import React, { FormEventHandler, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';

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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        New Income
                    </h2>
                    <Link
                        href={route('incomes.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to List
                    </Link>
                </div>
            }
        >
            <Head title="New Income" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    {inquiry && (
                        <div className="mb-6 rounded-lg bg-blue-50 p-4">
                            <p className="text-sm text-blue-800">
                                <strong>Creating income from inquiry:</strong> {inquiry.location_name}
                            </p>
                        </div>
                    )}

                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900">Income Details</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="income_date" value="Income Date *" />
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
                                        <InputLabel htmlFor="performance_type_id" value="Performance Type *" />
                                        <select
                                            id="performance_type_id"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.performance_type_id}
                                            onChange={(e) => setData('performance_type_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select type...</option>
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
                                        label="Amount"
                                        value={data.amount}
                                        onChange={(value) => setData('amount', value)}
                                        currency={data.currency}
                                        error={errors.amount}
                                        required
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="contact_person" value="Contact Person *" />
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
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Invoice Issued</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Notes" />
                                <textarea
                                    id="notes"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('incomes.index')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Income
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
