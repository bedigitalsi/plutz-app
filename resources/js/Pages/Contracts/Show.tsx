import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';

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
    const handleSend = () => {
        if (confirm('Send contract invitation to ' + contract.client_email + '?')) {
            router.post(route('contracts.send', contract.id));
        }
    };

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this contract?')) {
            router.delete(route('contracts.destroy', contract.id));
        }
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            signed: 'bg-green-100 text-green-800',
        };
        return (
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Contract Details</h2>
                    <Link
                        href={route('contracts.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Contracts
                    </Link>
                </div>
            }
        >
            <Head title="Contract Details" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {flash.success}
                        </div>
                    )}
                    {flash?.signing_url && (
                        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                            <strong>Signing URL (for testing):</strong><br />
                            <a href={flash.signing_url} target="_blank" className="underline">
                                {flash.signing_url}
                            </a>
                        </div>
                    )}

                    {/* Status & Actions */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                                <div className="mt-2">{getStatusBadge(contract.status)}</div>
                            </div>
                            <div className="space-x-2">
                                {contract.status === 'draft' && (
                                    <>
                                        <Link
                                            href={route('contracts.edit', contract.id)}
                                            className="inline-flex items-center px-4 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={handleSend}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                        >
                                            Send Invitation
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                                {contract.status === 'sent' && (
                                    <button
                                        onClick={handleSend}
                                        className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700"
                                    >
                                        Resend Invitation
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Client Information */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Name</dt>
                                <dd className="mt-1 text-sm text-gray-900">{contract.client_name}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email</dt>
                                <dd className="mt-1 text-sm text-gray-900">{contract.client_email}</dd>
                            </div>
                            {contract.client_company && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Company</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{contract.client_company}</dd>
                                </div>
                            )}
                            {contract.client_address && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{contract.client_address}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Performance Date</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(contract.performance_date).toLocaleDateString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Total Price</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                    {contract.currency} {parseFloat(contract.total_price).toFixed(2)}
                                </dd>
                            </div>
                            {contract.deposit_amount && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Deposit</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {contract.currency} {parseFloat(contract.deposit_amount).toFixed(2)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Contract Content */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Contract Content</h3>
                        <div className="prose max-w-none text-sm whitespace-pre-line">
                            {contract.markdown_snapshot}
                        </div>
                    </div>

                    {/* Signing Information */}
                    {contract.status === 'signed' && contract.signer_name && (
                        <div className="bg-green-50 overflow-hidden shadow-sm sm:rounded-lg p-6 border border-green-200">
                            <h3 className="text-lg font-medium text-green-900 mb-4">Signature Information</h3>
                            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <dt className="text-sm font-medium text-green-700">Signed by</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{contract.signer_name}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-green-700">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{contract.signer_email}</dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-green-700">Signed at</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {contract.signed_at && new Date(contract.signed_at).toLocaleString()}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}

                    {/* Attachments */}
                    {contract.attachments && contract.attachments.length > 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Attachments</h3>
                            <ul className="space-y-2">
                                {contract.attachments.map((attachment: any) => (
                                    <li key={attachment.id} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-900">{attachment.original_name}</span>
                                        <a
                                            href={route('attachments.download', attachment.id)}
                                            className="text-blue-600 hover:text-blue-800 text-sm"
                                        >
                                            Download
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="bg-gray-50 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Metadata</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <dt className="text-gray-500">Created by</dt>
                                <dd className="mt-1 text-gray-900">{contract.creator.name}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Contract ID</dt>
                                <dd className="mt-1 text-gray-900 font-mono">{contract.public_id}</dd>
                            </div>
                            {contract.sent_at && (
                                <div>
                                    <dt className="text-gray-500">Sent at</dt>
                                    <dd className="mt-1 text-gray-900">
                                        {new Date(contract.sent_at).toLocaleString()}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
