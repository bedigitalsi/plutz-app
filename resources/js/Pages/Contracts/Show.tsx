import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface Contract {
    id: number;
    public_id: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_address: string | null;
    performance_date: string;
    total_price: string;
    deposit_amount: string | null;
    currency: string;
    status: string;
    markdown_snapshot: string;
    sent_at: string | null;
    signed_at: string | null;
    signer_name: string | null;
    signer_email: string | null;
    creator: {
        name: string;
    };
    sign_tokens: any[];
    attachments: any[];
}

interface Props extends PageProps {
    contract: Contract;
}

export default function Show({ auth, contract, flash }: Props & { flash?: any }) {
    const { t } = useTranslation();
    const handleSend = () => {
        if (confirm(t('contracts.send_confirmation').replace(':email', contract.client_email))) {
            router.post(route('contracts.send', contract.id));
        }
    };

    const handleDelete = () => {
        if (confirm(t('contracts.confirm_delete'))) {
            router.delete(route('contracts.destroy', contract.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-stone-800 text-plutz-cream',
            sent: 'bg-plutz-tan/20 text-plutz-tan',
            signed: 'bg-green-500/100/10 text-green-400',
        };
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-stone-800 text-plutz-cream'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('contracts.contract_details')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('contracts.contract_details')}</h2>
                    <Link href={route('contracts.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('contracts.back_to_contracts')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-500/100/10 border border-green-500/30 text-green-400 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.signing_url && (
                        <div className="bg-plutz-tan/20 border border-plutz-tan/30 text-plutz-tan px-4 py-3 rounded">
                            <strong>{t('contracts.signing_url')}</strong><br />
                            <a href={flash.signing_url} target="_blank" className="underline">
                                {flash.signing_url}
                            </a>
                        </div>
                    )}

                    {/* Status & Actions */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream">{t('common.status')}</h3>
                                <div className="mt-2">{getStatusBadge(contract.status)}</div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {contract.status === 'draft' && (
                                    <>
                                        <Link
                                            href={route('contracts.edit', contract.id)}
                                            className="inline-flex items-center px-4 py-2 bg-stone-700 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-stone-700"
                                        >
                                            {t('common.edit')}
                                        </Link>
                                        <button
                                            onClick={handleSend}
                                            className="inline-flex items-center px-4 py-2 bg-plutz-tan border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-plutz-tan/90"
                                        >
                                            {t('contracts.send_invitation')}
                                        </button>
                                    </>
                                )}
                                {contract.status === 'sent' && (
                                    <button
                                        onClick={handleSend}
                                        className="inline-flex items-center px-4 py-2 bg-plutz-tan border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-plutz-tan/90"
                                    >
                                        {t('contracts.resend_invitation')}
                                    </button>
                                )}
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                                >
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.client_information')}</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-stone-500">{t('common.name')}</dt>
                                <dd className="mt-1 text-sm text-plutz-cream">{contract.client_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-stone-500">{t('common.email')}</dt>
                                <dd className="mt-1 text-sm text-plutz-cream">{contract.client_email}</dd>
                            </div>
                            {contract.client_company && (
                                <div>
                                    <dt className="text-sm font-medium text-stone-500">{t('contracts.client_company')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream">{contract.client_company}</dd>
                                </div>
                            )}
                            {contract.client_address && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-stone-500">{t('contracts.client_address')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream whitespace-pre-line">{contract.client_address}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.financial_details')}</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-stone-500">{t('contracts.performance_date')}</dt>
                                <dd className="mt-1 text-sm text-plutz-cream">
                                    {new Date(contract.performance_date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-stone-500">{t('contracts.total_price')}</dt>
                                <dd className="mt-1 text-sm text-plutz-cream font-semibold">
                                    {contract.currency} {parseFloat(contract.total_price).toFixed(2)}
                                </dd>
                            </div>
                            {contract.deposit_amount && (
                                <div>
                                    <dt className="text-sm font-medium text-stone-500">{t('contracts.deposit')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream">
                                        {contract.currency} {parseFloat(contract.deposit_amount).toFixed(2)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Contract Content */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.contract_content')}</h3>
                        <div className="bg-white rounded-lg p-6">
                            <div className="prose max-w-none text-sm text-stone-900 whitespace-pre-line">
                                {contract.markdown_snapshot}
                            </div>
                        </div>
                    </div>

                    {/* Signing Information */}
                    {contract.status === 'signed' && contract.signer_name && (
                        <div className="bg-green-500/10 overflow-hidden shadow-sm sm:rounded-lg p-6 border border-green-500/20">
                            <h3 className="text-lg font-medium text-green-400 mb-4">{t('contracts.signature_information')}</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-green-400">{t('contracts.signed_by')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream">{contract.signer_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-green-400">{t('common.email')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream">{contract.signer_email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-green-400">{t('contracts.signed_at')}</dt>
                                    <dd className="mt-1 text-sm text-plutz-cream">
                                        {contract.signed_at && new Date(contract.signed_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    {/* Attachments */}
                    {contract.attachments && contract.attachments.length > 0 && (
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('expenses.attachments')}</h3>
                            <ul className="space-y-2">
                                {contract.attachments.map((attachment: any) => (
                                    <li key={attachment.id} className="flex justify-between items-center">
                                        <span className="text-sm text-plutz-cream">{attachment.original_name}</span>
                                        <a
                                            href={route('attachments.download', attachment.id)}
                                            className="text-plutz-tan hover:text-plutz-tan text-sm"
                                        >
                                            {t('expenses.download')}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-stone-900/50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.metadata')}</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-stone-500">{t('contracts.created_by')}</dt>
                                <dd className="mt-1 text-plutz-cream">{contract.creator.name}</dd>
                            </div>
                            <div>
                                <dt className="text-stone-500">{t('contracts.contract_id')}</dt>
                                <dd className="mt-1 text-plutz-cream font-mono">{contract.public_id}</dd>
                            </div>
                            {contract.sent_at && (
                                <div>
                                    <dt className="text-stone-500">{t('contracts.sent_at')}</dt>
                                    <dd className="mt-1 text-plutz-cream">
                                        {new Date(contract.sent_at).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
