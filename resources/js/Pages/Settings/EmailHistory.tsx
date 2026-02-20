import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/Components/Modal';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, type MouseEvent } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface EmailLog {
    id: number;
    to_email: string;
    from_email: string;
    from_name: string;
    subject: string;
    body: string;
    type: 'contract_invitation' | 'contract_signed' | 'inquiry_confirmed' | 'test' | 'other';
    status: 'sent' | 'failed';
    error_message: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    emailLogs: {
        data: EmailLog[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
    };
    filters: {
        search?: string;
        type?: string;
    };
}

const typeLabels: Record<string, string> = {
    contract_invitation: 'Contract Invitation',
    contract_signed: 'Contract Signed',
    inquiry_confirmed: 'Inquiry Confirmed',
    test: 'Test',
    other: 'Other',
};

export default function EmailHistory({ emailLogs, filters }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search || '');
    const [type, setType] = useState(filters.type || '');
    const [showModal, setShowModal] = useState(false);
    const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
    const [loadingLog, setLoadingLog] = useState(false);

    const {
        data: bulkData,
        setData: setBulkData,
        post: postBulk,
        processing: bulkProcessing,
    } = useForm({
        older_than_days: '30',
    });

    const handleFilter = () => {
        const params: Record<string, string> = {};

        if (search) {
            params.search = search;
        }

        if (type) {
            params.type = type;
        }

        router.get(route('settings.email-history'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setSearch('');
        setType('');
        router.get(route('settings.email-history'));
    };

    const openEmailLog = async (id: number) => {
        setLoadingLog(true);
        setShowModal(true);

        try {
            const response = await window.axios.get(route('settings.email-history.show', id));
            setSelectedLog(response.data);
        } catch (error) {
            setSelectedLog(null);
            alert(t('Failed to load email details.'));
        } finally {
            setLoadingLog(false);
        }
    };

    const handleDelete = (event: MouseEvent, id: number) => {
        event.stopPropagation();

        if (confirm(t('Are you sure you want to delete this email log?'))) {
            router.delete(route('settings.email-history.destroy', id));
        }
    };

    const handleBulkDelete = () => {
        if (confirm(t('Are you sure you want to bulk delete email logs?'))) {
            postBulk(route('settings.email-history.bulk-delete'));
        }
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('Email History')} />

            <div className="mx-auto w-full max-w-[1200px] p-6 pb-0">
                <div className="mb-2 flex items-center justify-between">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('Email History')}</h2>
                    <Link href={route('settings.index')} className="text-sm font-medium text-plutz-tan hover:text-plutz-tan-light">
                        {t('Back to Settings')}
                    </Link>
                </div>
            </div>

            <div className="mx-auto w-full max-w-[1200px] space-y-6 p-6">
                <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-plutz-tan/20">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                            <label className="block text-sm font-medium text-plutz-tan">{t('Search')}</label>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={t('Search by To email or Subject')}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-plutz-tan">{t('Type')}</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                            >
                                <option value="">{t('All Types')}</option>
                                <option value="contract_invitation">{t('Contract Invitation')}</option>
                                <option value="contract_signed">{t('Contract Signed')}</option>
                                <option value="inquiry_confirmed">{t('Inquiry Confirmed')}</option>
                                <option value="test">{t('Test')}</option>
                                <option value="other">{t('Other')}</option>
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                type="button"
                                onClick={handleFilter}
                                className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-plutz-dark hover:bg-plutz-tan-light"
                            >
                                {t('Apply')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-md bg-plutz-dark px-4 py-2 text-sm font-semibold text-plutz-cream border border-plutz-tan/20 hover:bg-stone-900"
                            >
                                {t('Reset')}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-plutz-tan/20">
                    <h3 className="text-lg font-medium text-plutz-cream">{t('Bulk Delete')}</h3>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                        <div className="w-full sm:w-64">
                            <label className="block text-sm font-medium text-plutz-tan">{t('Delete logs older than')}</label>
                            <select
                                value={bulkData.older_than_days}
                                onChange={(e) => setBulkData('older_than_days', e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                            >
                                <option value="7">{t('7 days')}</option>
                                <option value="30">{t('30 days')}</option>
                                <option value="90">{t('90 days')}</option>
                                <option value="365">{t('1 year')}</option>
                                <option value="all">{t('All')}</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleBulkDelete}
                            disabled={bulkProcessing}
                            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
                        >
                            {bulkProcessing ? t('Deleting...') : t('Delete Logs')}
                        </button>
                    </div>
                </div>

                {emailLogs.data.length === 0 ? (
                    <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm border border-plutz-tan/20">
                        <p className="text-plutz-tan">{t('No email logs found.')}</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm border border-plutz-tan/20">
                        <table className="min-w-full divide-y divide-plutz-tan/20">
                            <thead className="bg-plutz-dark">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('Date')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('To')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('Subject')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('Type')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('Status')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-plutz-tan">{t('Actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-plutz-tan/20 bg-plutz-surface">
                                {emailLogs.data.map((emailLog) => (
                                    <tr
                                        key={emailLog.id}
                                        className="cursor-pointer hover:bg-plutz-dark/60"
                                        onClick={() => openEmailLog(emailLog.id)}
                                    >
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-plutz-cream">
                                            {new Date(emailLog.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-plutz-tan">{emailLog.to_email}</td>
                                        <td className="px-4 py-3 text-sm text-plutz-cream">{emailLog.subject}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className="inline-flex rounded-full bg-plutz-tan/20 px-2 py-1 text-xs font-semibold text-plutz-tan">
                                                {t(typeLabels[emailLog.type] || 'Other')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                    emailLog.status === 'sent'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : 'bg-red-500/20 text-red-400'
                                                }`}
                                            >
                                                {t(emailLog.status === 'sent' ? 'Sent' : 'Failed')}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                            <button
                                                type="button"
                                                onClick={(event) => handleDelete(event, emailLog.id)}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                {t('Delete')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {emailLogs.last_page > 1 && (
                    <div className="flex justify-center">
                        <nav className="flex gap-2">
                            {emailLogs.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    preserveState
                                    preserveScroll
                                    className={`rounded-md px-3 py-2 text-sm ${
                                        link.active
                                            ? 'bg-plutz-tan text-plutz-dark'
                                            : 'bg-plutz-surface text-plutz-tan hover:bg-plutz-dark'
                                    } ${!link.url ? 'cursor-not-allowed opacity-40' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </nav>
                    </div>
                )}
            </div>

            <Modal show={showModal} maxWidth="2xl" onClose={() => setShowModal(false)}>
                <div className="p-6">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-plutz-cream">{t('Email Details')}</h3>
                        <button
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="text-plutz-tan hover:text-plutz-cream"
                        >
                            {t('Close')}
                        </button>
                    </div>

                    {loadingLog ? (
                        <p className="text-plutz-tan">{t('Loading...')}</p>
                    ) : selectedLog ? (
                        <div className="space-y-4">
                            <div className="rounded-md border border-plutz-tan/20 bg-plutz-dark p-4">
                                <p className="text-sm text-plutz-tan"><strong>{t('Date')}:</strong> {new Date(selectedLog.created_at).toLocaleString()}</p>
                                <p className="text-sm text-plutz-tan"><strong>{t('To')}:</strong> {selectedLog.to_email}</p>
                                <p className="text-sm text-plutz-tan"><strong>{t('From')}:</strong> {selectedLog.from_name} ({selectedLog.from_email})</p>
                                <p className="text-sm text-plutz-tan"><strong>{t('Subject')}:</strong> {selectedLog.subject}</p>
                            </div>

                            <div>
                                <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-plutz-tan">{t('Body')}</h4>
                                <iframe
                                    title={`email-log-${selectedLog.id}`}
                                    sandbox=""
                                    srcDoc={selectedLog.body || ''}
                                    className="h-[420px] w-full rounded-md border border-plutz-tan/20 bg-white"
                                />
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-400">{t('Unable to load this email log.')}</p>
                    )}
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
