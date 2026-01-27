import React, { FormEventHandler, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';
import FileUpload from '@/Components/FileUpload';

interface Attachment {
    id: string;
    original_name: string;
    mime: string;
    size: number;
}

interface Expense {
    id: number;
    invoice_date: string;
    amount: number;
    currency: string;
    company_name: string;
    notes?: string;
    status: string;
    attachments: Attachment[];
}

interface Props {
    expense: Expense;
}

export default function Edit({ expense }: Props) {
    const [attachmentsToDelete, setAttachmentsToDelete] = useState<string[]>([]);

    // Format date to YYYY-MM-DD for the date input
    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PATCH',
        invoice_date: formatDateForInput(expense.invoice_date),
        amount: expense.amount.toString(),
        currency: expense.currency,
        company_name: expense.company_name,
        notes: expense.notes || '',
        status: expense.status,
        attachment: null as File | null,
        delete_attachments: [] as string[],
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        data.delete_attachments = attachmentsToDelete;
        post(route('expenses.update', expense.id));
    };

    const toggleDeleteAttachment = (attachmentId: string) => {
        setAttachmentsToDelete(prev =>
            prev.includes(attachmentId)
                ? prev.filter(id => id !== attachmentId)
                : [...prev, attachmentId]
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes >= 1048576) {
            return (bytes / 1048576).toFixed(2) + ' MB';
        } else if (bytes >= 1024) {
            return (bytes / 1024).toFixed(2) + ' KB';
        }
        return bytes + ' bytes';
    };

    const remainingAttachments = expense.attachments.filter(
        att => !attachmentsToDelete.includes(att.id)
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Edit Expense
                    </h2>
                    <Link
                        href={route('expenses.show', expense.id)}
                        className="text-sm text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Details
                    </Link>
                </div>
            }
        >
            <Head title="Edit Expense" />

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Invoice Details */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900">Invoice Details</h3>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="invoice_date" value="Invoice Date *" />
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
                                        <InputLabel htmlFor="company_name" value="Company Name *" />
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
                                        label="Amount"
                                        value={data.amount}
                                        onChange={(value) => setData('amount', value)}
                                        currency={data.currency}
                                        error={errors.amount}
                                        required
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="status" value="Status" />
                                    <select
                                        id="status"
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        value={data.status}
                                        onChange={(e) => setData('status', e.target.value)}
                                    >
                                        <option value="paid">Paid</option>
                                        <option value="unpaid">Unpaid</option>
                                    </select>
                                    <InputError message={errors.status} className="mt-2" />
                                </div>
                            </div>

                            {/* Existing Attachments */}
                            {expense.attachments.length > 0 && (
                                <div className="border-b border-gray-200 pb-6">
                                    <h3 className="text-lg font-medium text-gray-900">Current Attachments</h3>
                                    <p className="mt-1 text-sm text-gray-600">
                                        Click to mark attachments for deletion
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        {expense.attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className={`flex items-center justify-between rounded-lg border p-4 ${
                                                    attachmentsToDelete.includes(attachment.id)
                                                        ? 'border-red-300 bg-red-50'
                                                        : 'border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <svg
                                                        className="h-8 w-8 text-gray-400"
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
                                                        <p className={`text-sm font-medium ${
                                                            attachmentsToDelete.includes(attachment.id)
                                                                ? 'text-red-600 line-through'
                                                                : 'text-gray-900'
                                                        }`}>
                                                            {attachment.original_name}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatFileSize(attachment.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeleteAttachment(attachment.id)}
                                                    className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                                        attachmentsToDelete.includes(attachment.id)
                                                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                    }`}
                                                >
                                                    {attachmentsToDelete.includes(attachment.id) ? 'Keep' : 'Delete'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Attachment */}
                            <div className="border-b border-gray-200 pb-6">
                                <h3 className="text-lg font-medium text-gray-900">Add New Attachment</h3>
                                <p className="mt-1 text-sm text-gray-600">
                                    Upload a photo or PDF of the invoice
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

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('expenses.show', expense.id)}
                                    className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Update Expense
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
