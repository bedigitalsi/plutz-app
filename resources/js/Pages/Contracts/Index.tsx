import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Contract {
    id: number;
    public_id: string;
    client_name: string;
    client_email: string;
    client_company: string | null;
    performance_date: string;
    total_price: string;
    status: string;
    created_at: string;
    creator: {
        name: string;
    };
}

interface Props extends PageProps {
    contracts: {
        data: Contract[];
        links: any[];
        meta: any;
    };
    filters: {
        status?: string;
        search?: string;
    };
}

export default function Index({ auth, contracts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');

    const handleFilter = () => {
        router.get('/contracts', { status, search }, { preserveState: true });
    };

    const handleDelete = (contract: Contract) => {
        if (confirm('Are you sure you want to delete this contract?')) {
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
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status as keyof typeof colors] || 'bg-stone-800 text-plutz-cream'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Contracts" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Contracts</h2>
                    <Link href={route('contracts.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">+ New Contract</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Filters */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg mb-6 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Search
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by client name, email..."
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    Status
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="signed">Signed</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button
                                    onClick={handleFilter}
                                    className="w-full px-4 py-2 bg-stone-700 text-white rounded-md hover:bg-stone-700"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contracts List */}
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                            Client
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                            Performance Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                            Total Price
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-plutz-surface divide-y divide-plutz-tan/10">
                                    {contracts.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-stone-500">
                                                No contracts found. Create your first contract!
                                            </td>
                                        </tr>
                                    ) : (
                                        contracts.data.map((contract) => (
                                            <tr key={contract.id} className="hover:bg-stone-900/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-plutz-cream">
                                                        {contract.client_name}
                                                    </div>
                                                    <div className="text-sm text-stone-500">
                                                        {contract.client_email}
                                                    </div>
                                                    {contract.client_company && (
                                                        <div className="text-sm text-stone-500">
                                                            {contract.client_company}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-plutz-cream">
                                                    {new Date(contract.performance_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-plutz-cream">
                                                    €{parseFloat(contract.total_price).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(contract.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                    <Link
                                                        href={route('contracts.show', contract.id)}
                                                        className="text-plutz-tan hover:text-plutz-tan"
                                                    >
                                                        View
                                                    </Link>
                                                    {contract.status === 'draft' && (
                                                        <>
                                                            <Link
                                                                href={route('contracts.edit', contract.id)}
                                                                className="text-plutz-tan hover:text-plutz-tan"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleDelete(contract)}
                                                                className="text-red-400 hover:text-red-300"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {contracts.links && contracts.links.length > 3 && (
                            <div className="px-6 py-4 border-t border-plutz-tan/10">
                                <div className="flex justify-center space-x-1">
                                    {contracts.links.map((link: any, index: number) => (
                                        <button
                                            key={index}
                                            onClick={() => link.url && router.get(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 text-sm rounded ${
                                                link.active
                                                    ? 'bg-plutz-tan text-plutz-dark'
                                                    : link.url
                                                    ? 'bg-stone-800 text-stone-400 hover:bg-plutz-tan/20'
                                                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
