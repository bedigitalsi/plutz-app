import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface GroupCost {
    id: number;
    cost_date: string;
    amount: number;
    currency: string;
    is_paid: boolean;
    notes?: string;
    cost_type: {
        name: string;
    };
    creator: {
        name: string;
    };
}

interface CostType {
    id: number;
    name: string;
}

interface Props {
    groupCosts: {
        data: GroupCost[];
        links: any[];
    };
    costTypes: CostType[];
    filters: any;
}

export default function Index({ groupCosts, costTypes, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [costTypeId, setCostTypeId] = useState(filters.cost_type_id || '');
    const [isPaid, setIsPaid] = useState(filters.is_paid || '');

    const handleFilter = () => {
        router.get(route('group-costs.index'), 
            { date_from: dateFrom, date_to: dateTo, cost_type_id: costTypeId, is_paid: isPaid }, 
            { preserveState: true }
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getTotalCosts = (paid: boolean | null = null) => {
        let costs = groupCosts.data;
        if (paid !== null) {
            costs = costs.filter(c => c.is_paid === paid);
        }
        return costs.reduce((sum, cost) => sum + parseFloat(cost.amount.toString()), 0).toFixed(2);
    };

    const togglePaid = (costId: number, currentStatus: boolean) => {
        router.patch(route('group-costs.update', costId), {
            is_paid: !currentStatus
        }, {
            preserveState: true,
        });
    };

    const handleDelete = (costId: number) => {
        if (confirm('Are you sure you want to delete this group cost?')) {
            router.delete(route('group-costs.destroy', costId));
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Group Costs
                    </h2>
                    <Link
                        href={route('group-costs.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        New Cost
                    </Link>
                </div>
            }
        >
            <Head title="Group Costs" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Cost Type</label>
                                <select
                                    value={costTypeId}
                                    onChange={(e) => setCostTypeId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">All</option>
                                    {costTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select
                                    value={isPaid}
                                    onChange={(e) => setIsPaid(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                >
                                    <option value="">All</option>
                                    <option value="yes">Paid</option>
                                    <option value="no">Unpaid</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {groupCosts.data.length > 0 && (
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-600">Total Costs</p>
                                <p className="text-2xl font-bold text-gray-900">{getTotalCosts()} EUR</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-600">Paid</p>
                                <p className="text-2xl font-bold text-green-600">{getTotalCosts(true)} EUR</p>
                            </div>
                            <div className="rounded-lg bg-white p-4 shadow-sm">
                                <p className="text-sm text-gray-600">Unpaid</p>
                                <p className="text-2xl font-bold text-yellow-600">{getTotalCosts(false)} EUR</p>
                            </div>
                        </div>
                    )}

                    {/* Costs List */}
                    {groupCosts.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-500">No group costs found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Notes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {groupCosts.data.map((cost) => (
                                        <tr key={cost.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {formatDate(cost.cost_date)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {cost.cost_type.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                                                {parseFloat(cost.amount.toString()).toFixed(2)} {cost.currency}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {cost.notes && cost.notes.substring(0, 50)}
                                                {cost.notes && cost.notes.length > 50 && '...'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => togglePaid(cost.id, cost.is_paid)}
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        cost.is_paid
                                                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                                    }`}
                                                >
                                                    {cost.is_paid ? 'Paid' : 'Unpaid'}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('group-costs.edit', cost.id)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(cost.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
