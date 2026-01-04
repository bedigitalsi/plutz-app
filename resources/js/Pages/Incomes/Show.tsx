import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import DistributionForm from '@/Components/DistributionForm';

interface Income {
    id: number;
    income_date: string;
    amount: number;
    currency: string;
    invoice_issued: boolean;
    contact_person: string;
    notes?: string;
    performance_type: {
        name: string;
    };
    inquiry?: {
        id: number;
        location_name: string;
    };
    creator: {
        name: string;
    };
    distributions: Array<{
        id: number;
        recipient_type: 'user' | 'mutual_fund';
        recipient_user_id?: number;
        amount: number;
        note?: string;
        recipient_user?: {
            name: string;
        };
    }>;
}

interface BandMember {
    id: number;
    name: string;
    is_band_member: boolean;
}

interface Props {
    income: Income;
    bandMembers: BandMember[];
    totalDistributed: number;
    remaining: number;
}

export default function Show({ income, bandMembers, totalDistributed, remaining }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        distributions: [],
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleDistribute = (distributions: any[]) => {
        router.post(route('incomes.distribute', income.id), {
            distributions,
        });
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this income? All distributions will also be deleted.')) {
            router.delete(route('incomes.destroy', income.id));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Income Details
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
            <Head title={`Income - ${income.contact_person}`} />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {income.contact_person}
                                    </h3>
                                    <p className="mt-1 text-lg font-semibold text-green-600">
                                        {parseFloat(income.amount.toString()).toFixed(2)} {income.currency}
                                    </p>
                                    {income.inquiry && (
                                        <p className="mt-1 text-sm text-gray-600">
                                            From: {income.inquiry.location_name}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {income.invoice_issued && (
                                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
                                            Invoice Issued
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleDelete}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h4 className="text-lg font-medium text-gray-900">Income Details</h4>
                        </div>
                        <div className="p-6">
                            <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{formatDate(income.income_date)}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Performance Type</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{income.performance_type.name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created By</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{income.creator.name}</dd>
                                </div>
                            </dl>
                            {income.notes && (
                                <div className="mt-4">
                                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                                    <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{income.notes}</dd>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Distribution */}
                    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h4 className="text-lg font-medium text-gray-900">Distribution</h4>
                        </div>
                        <div className="p-6">
                            <DistributionForm
                                bandMembers={bandMembers}
                                totalAmount={parseFloat(income.amount.toString())}
                                existingDistributions={income.distributions}
                                onSubmit={handleDistribute}
                                processing={processing}
                                errors={errors}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
