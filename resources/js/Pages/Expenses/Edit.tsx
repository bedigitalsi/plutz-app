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
    const { t } = useTranslation();
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
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('expenses.edit_expense')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('expenses.edit_expense')}</h2>
                    <Link href={route('expenses.show', expense.id)} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('expenses.back_to_details')}</Link>
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

                            {/* Existing Attachments */}
                            {expense.attachments.length > 0 && (
                                <div className="border-b border-plutz-tan/10 pb-6">
                                    <h3 className="text-lg font-medium text-plutz-cream">{t('expenses.current_attachments')}</h3>
                                    <p className="mt-1 text-sm text-stone-400">
                                        {t('expenses.mark_for_deletion')}
                                    </p>

                                    <div className="mt-4 space-y-3">
                                        {expense.attachments.map((attachment) => (
                                            <div
                                                key={attachment.id}
                                                className={`flex items-center justify-between rounded-lg border p-4 ${
                                                    attachmentsToDelete.includes(attachment.id)
                                                        ? 'border-red-500/20 bg-red-500/10'
                                                        : 'border-plutz-tan/10'
                                                }`}
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
                                                        <p className={`text-sm font-medium ${
                                                            attachmentsToDelete.includes(attachment.id)
                                                                ? 'text-red-400 line-through'
                                                                : 'text-plutz-cream'
                                                        }`}>
                                                            {attachment.original_name}
                                                        </p>
                                                        <p className="text-sm text-stone-500">
                                                            {formatFileSize(attachment.size)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleDeleteAttachment(attachment.id)}
                                                    className={`rounded-md px-3 py-2 text-sm font-semibold ${
                                                        attachmentsToDelete.includes(attachment.id)
                                                            ? 'bg-plutz-tan/20 text-stone-400 hover:bg-plutz-tan/30'
                                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                    }`}
                                                >
                                                    {attachmentsToDelete.includes(attachment.id) ? t('expenses.keep') : t('common.delete')}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New Attachment */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('expenses.new_attachment')}</h3>
                                <p className="mt-1 text-sm text-stone-400">
                                    {t('expenses.attachment_hint')}
                                </p>

                                <div className="mt-4">
                                    <FileUpload
                                        accept="image/*,application/pdf"
                                        onChange={(file) => setData('attachment', file)}
                                        error={errors.attachment}
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
                                    href={route('expenses.show', expense.id)}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('expenses.update_expense')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
