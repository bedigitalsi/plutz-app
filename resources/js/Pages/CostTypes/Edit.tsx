import React, { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface CostType {
    id: number;
    name: string;
    is_active: boolean;
    group_costs_count: number;
}

interface Props {
    costType: CostType;
}

export default function Edit({ costType }: Props) {
    const { data, setData, patch, processing, errors } = useForm({
        name: costType.name,
        is_active: costType.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('cost-types.update', costType.id));
    };

    const totalUsage = costType.group_costs_count;

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Edit Cost Type" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Edit Cost Type</h2>
                    <Link href={route('cost-types.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">Back to List</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">Cost Type Details</h3>
                                <p className="mt-1 text-sm text-stone-400">
                                    Update cost type information
                                </p>

                                {totalUsage > 0 && (
                                    <div className="mt-4 rounded-md bg-plutz-tan/10 p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3 flex-1 md:flex md:justify-between">
                                                <p className="text-sm text-plutz-tan">
                                                    This cost type is used in {costType.group_costs_count} group cost(s).
                                                    You can deactivate it but cannot delete it.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4">
                                    <InputLabel htmlFor="name" value="Cost Type Name *" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Fuel, Equipment, Marketing"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="rounded border-plutz-tan/20 text-plutz-tan shadow-sm focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">Active</span>
                                    </label>
                                    <p className="mt-1 text-xs text-stone-500">
                                        Only active cost types appear in dropdown lists
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('cost-types.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Cost Type
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
