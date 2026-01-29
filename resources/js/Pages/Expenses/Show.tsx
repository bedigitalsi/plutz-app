import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Expense {
    id: number;
    invoice_date: string;
    amount: number;
    currency: string;
    company_name: string;
    notes?: string;
    status: string;
    entered_at: string;
    creator: {
        name: string;
    };
    attachments: Array<{
        id: string;
        original_name: string;
        mime: string;
        size: number;
    }>;
}

interface Props {
    expense: Expense;
}

export default function Show({ expense }: Props) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateTimeString: string) => {
        return new Date(dateTimeString).toLocaleString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' bytes';
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this expense?')) {
            router.delete(route('expenses.destroy', expense.id));
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={`Expense - ${expense.company_name}`} />

            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Header */}
                    <div className="mb-6 overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                        <div className="p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-bold text-plutz-cream">
                                        {expense.company_name}
                                    </h3>
                                    <p className="mt-1 text-lg font-semibold text-plutz-cream">
                                        {parseFloat(expense.amount.toString()).toFixed(2)} {expense.currency}
                                    </p>
                                </div>
                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                    expense.status === 'paid' 
                                        ? 'bg-green-500/100/10 text-green-400' 
                                        : 'bg-amber-500/10 text-amber-400'
                                }`}>
                                    {expense.status === 'paid' ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <Link
                                    href={route('expenses.edit', expense.id)}
                                    className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500/100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-6">
                        {/* Invoice Details */}
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <div className="border-b border-plutz-tan/10 px-6 py-4">
                                <h4 className="text-lg font-medium text-plutz-cream">Invoice Details</h4>
                            </div>
                            <div className="p-6">
                                <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Invoice Date</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{formatDate(expense.invoice_date)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Entered At</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{formatDateTime(expense.entered_at)}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-stone-500">Created By</dt>
                                        <dd className="mt-1 text-sm text-plutz-cream">{expense.creator.name}</dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Notes */}
                        {expense.notes && (
                            <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                                <div className="border-b border-plutz-tan/10 px-6 py-4">
                                    <h4 className="text-lg font-medium text-plutz-cream">Notes</h4>
                                </div>
                                <div className="p-6">
                                    <p className="whitespace-pre-wrap text-sm text-stone-400">{expense.notes}</p>
                                </div>
                            </div>
                        )}

                        {/* Attachments */}
                        {expense.attachments.length > 0 && (
                            <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                                <div className="border-b border-plutz-tan/10 px-6 py-4">
                                    <h4 className="text-lg font-medium text-plutz-cream">Attachments</h4>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-3">
                                        {expense.attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className="flex items-center justify-between rounded-lg border border-plutz-tan/10 p-4"
                                            >
                                                <div className="flex items-center">
                                                    <svg
                                                        className="h-8 w-8 text-stone-500"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                                                        />
                                                    </svg>
                                                    <div className="ml-4">
                                                        <p className="text-sm font-medium text-plutz-cream">
                                                            {attachment.original_name}
                                                        </p>
                                                        <p className="text-sm text-stone-500">
                                                            {formatFileSize(attachment.size)} • {attachment.mime}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={`/attachments/${attachment.id}/download`}
                                                    className="rounded-md bg-plutz-tan px-3 py-2 text-sm font-semibold text-white hover:bg-plutz-tan/90"
                                                    download
                                                >
                                                    Download
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
