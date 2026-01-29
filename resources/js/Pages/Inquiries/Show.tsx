import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import StatusBadge from '@/Components/StatusBadge';

interface Inquiry {
    id: number;
    performance_date: string;
    performance_time_mode: 'exact_time' | 'text_time';
    performance_time_exact?: string;
    performance_time_text?: string;
    duration_minutes: number;
    location_name: string;
    location_address?: string;
    contact_person: string;
    contact_email?: string;
    contact_phone?: string;
    status: 'pending' | 'confirmed' | 'rejected';
    price_amount?: number;
    currency: string;
    notes?: string;
    performance_type?: {
        name: string;
    };
    band_size?: {
        label: string;
    };
    income?: {
        id: number;
        amount: number;
    };
}

interface Props {
    inquiry: Inquiry;
}

export default function Show({ inquiry }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const handleStatusChange = (status: 'pending' | 'confirmed' | 'rejected') => {
        if (confirm(`Are you sure you want to mark this inquiry as ${status}?`)) {
            router.patch(route('inquiries.update-status', inquiry.id), { status });
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this inquiry?')) {
            router.delete(route('inquiries.destroy', inquiry.id));
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={`Inquiry - ${inquiry.location_name}`} />

            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Header with Status */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-plutz-cream">
                                        {inquiry.location_name}
                                    </h3>
                                    <p className="mt-1 text-stone-400">{inquiry.contact_person}</p>
                                </div>
                                <StatusBadge status={inquiry.status} />
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-wrap gap-2">
                                <Link
                                    href={route('inquiries.edit', inquiry.id)}
                                    className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                                >
                                    Edit
                                </Link>

                                {inquiry.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusChange('confirmed')}
                                            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500/100"
                                        >
                                            Confirm
                                        </button>
                                        <button
                                            onClick={() => handleStatusChange('rejected')}
                                            className="rounded-md bg-stone-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-900/500"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {!inquiry.income && (
                                    <Link
                                        href={`/incomes/create?inquiry_id=${inquiry.id}`}
                                        className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
                                    >
                                        Create Income
                                    </Link>
                                )}

                                {inquiry.status !== 'pending' && (
                                    <button
                                        onClick={() => handleStatusChange('pending')}
                                        className="rounded-md bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
                                    >
                                        Set to Pending
                                    </button>
                                )}

                                <button
                                    onClick={handleDelete}
                                    className="ml-auto rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500/100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Performance Details */}
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <div className="border-b border-plutz-tan/10 px-6 py-4">
                                <h4 className="text-lg font-medium text-plutz-cream">Performance Details</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Date</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{formatDate(inquiry.performance_date)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Time</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">
                                            {inquiry.performance_time_mode === 'exact_time' 
                                                ? inquiry.performance_time_exact 
                                                : inquiry.performance_time_text || 'Not specified'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Duration</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{inquiry.duration_minutes} minutes</dd>
                                    </div>
                                    {inquiry.performance_type && (
                                        <div>
                                            <dt className="text-sm font-medium text-stone-500">Type</dt>
                                            <dd className="mt-1 text-sm text-plutz-cream">{inquiry.performance_type.name}</dd>
                                        </div>
                                    )}
                                    {inquiry.band_size && (
                                        <div>
                                            <dt className="text-sm font-medium text-stone-500">Band Size</dt>
                                            <dd className="mt-1 text-sm text-plutz-cream">{inquiry.band_size.label}</dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <div className="border-b border-plutz-tan/10 px-6 py-4">
                                <h4 className="text-lg font-medium text-plutz-cream">Location</h4>
                            </div>
                            <div className="p-6">
                                <p className="text-sm text-plutz-cream">{inquiry.location_name}</p>
                                {inquiry.location_address && (
                                    <p className="mt-1 text-sm text-stone-400">{inquiry.location_address}</p>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <div className="border-b border-plutz-tan/10 px-6 py-4">
                                <h4 className="text-lg font-medium text-plutz-cream">Contact Information</h4>
                            </div>
                            <div className="p-6">
                                <dl className="space-y-2">
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Name</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{inquiry.contact_person}</dd>
                                    </div>
                                    {inquiry.contact_email && (
                                        <div>
                                            <dt className="text-sm font-medium text-stone-500">Email</dt>
                                            <dd className="mt-1 text-sm text-plutz-cream">
                                                <a href={`mailto:${inquiry.contact_email}`} className="text-plutz-tan hover:text-plutz-tan">
                                                    {inquiry.contact_email}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                    {inquiry.contact_phone && (
                                        <div>
                                            <dt className="text-sm font-medium text-stone-500">Phone</dt>
                                            <dd className="mt-1 text-sm text-plutz-cream">
                                                <a href={`tel:${inquiry.contact_phone}`} className="text-plutz-tan hover:text-plutz-tan">
                                                    {inquiry.contact_phone}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                </dl>
                            </div>
                        </div>

                        {/* Price */}
                        {inquiry.price_amount && (
                            <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                                <div className="border-b border-plutz-tan/10 px-6 py-4">
                                    <h4 className="text-lg font-medium text-plutz-cream">Price</h4>
                                </div>
                                <div className="p-6">
                                    <p className="text-2xl font-bold text-plutz-cream">
                                        {inquiry.price_amount} {inquiry.currency}
                                    </p>
                                    {inquiry.income && (
                                        <p className="mt-2 text-sm text-green-400">✓ Payment received</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {inquiry.notes && (
                            <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                                <div className="border-b border-plutz-tan/10 px-6 py-4">
                                    <h4 className="text-lg font-medium text-plutz-cream">Notes</h4>
                                </div>
                                <div className="p-6">
                                    <p className="whitespace-pre-wrap text-sm text-stone-400">{inquiry.notes}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
