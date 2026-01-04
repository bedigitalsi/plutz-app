import React, { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';

interface CostType {
    id: number;
    name: string;
}

interface Props {
    costTypes: CostType[];
}

export default function Create({ costTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        cost_date: new Date().toISOString().split('T')[0],
        cost_type_id: '',
        amount: '',
        currency: 'EUR',
        is_paid: true,
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('group-costs.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        New Group Cost
                    </h2>
                    <Link
                        href={route('group-costs.index')}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to List
                    </Link>
                </div>
            }
        >
            <Head title="New Group Cost" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900">Cost Details</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Track expenses paid from the mutual fund
                                </p>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="cost_date" value="Cost Date" />
                                        <TextInput
                                            id="cost_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.cost_date}
                                            onChange={(e) => setData('cost_date', e.target.value)}
                                        />
                                        <InputError message={errors.cost_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="cost_type_id" value="Cost Type *" />
                                        <select
                                            id="cost_type_id"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            value={data.cost_type_id}
                                            onChange={(e) => setData('cost_type_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select type...</option>
                                            {costTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.cost_type_id} className="mt-2" />
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
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_paid}
                                            onChange={(e) => setData('is_paid', e.target.checked)}
                                            className="rounded border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Mark as Paid</span>
                                    </label>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Paid costs are deducted from the mutual fund balance
                                    </p>
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
                                    href={route('group-costs.index')}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Group Cost
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
