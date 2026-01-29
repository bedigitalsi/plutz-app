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
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Group Costs" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Group Costs</h2>
                    <Link href={route('group-costs.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">New Cost</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400">From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-400">To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-400">Cost Type</label>
                                <select
                                    value={costTypeId}
                                    onChange={(e) => setCostTypeId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                >
                                    <option value="">All</option>
                                    {costTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-400">Status</label>
                                <select
                                    value={isPaid}
                                    onChange={(e) => setIsPaid(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
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
                                className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {groupCosts.data.length > 0 && (
                        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded-lg bg-plutz-surface p-4 shadow-sm">
                                <p className="text-sm text-stone-400">Total Costs</p>
                                <p className="text-2xl font-bold text-plutz-cream">{getTotalCosts()} EUR</p>
                            </div>
                            <div className="rounded-lg bg-plutz-surface p-4 shadow-sm">
                                <p className="text-sm text-stone-400">Paid</p>
                                <p className="text-2xl font-bold text-green-400">{getTotalCosts(true)} EUR</p>
                            </div>
                            <div className="rounded-lg bg-plutz-surface p-4 shadow-sm">
                                <p className="text-sm text-stone-400">Unpaid</p>
                                <p className="text-2xl font-bold text-amber-400">{getTotalCosts(false)} EUR</p>
                            </div>
                        </div>
                    )}

                    {/* Costs List */}
                    {groupCosts.data.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No group costs found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Notes</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                    {groupCosts.data.map((cost) => (
                                        <tr key={cost.id} className="hover:bg-stone-900/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-plutz-cream">
                                                {formatDate(cost.cost_date)}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-plutz-cream">
                                                {cost.cost_type.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-plutz-cream">
                                                {parseFloat(cost.amount.toString()).toFixed(2)} {cost.currency}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-stone-500">
                                                {cost.notes && cost.notes.substring(0, 50)}
                                                {cost.notes && cost.notes.length > 50 && '...'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <button
                                                    onClick={() => togglePaid(cost.id, cost.is_paid)}
                                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                                                        cost.is_paid
                                                            ? 'bg-green-500/100/10 text-green-400 hover:bg-green-500/100/20'
                                                            : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                                                    }`}
                                                >
                                                    {cost.is_paid ? 'Paid' : 'Unpaid'}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        href={route('group-costs.edit', cost.id)}
                                                        className="text-plutz-tan hover:text-plutz-tan"
                                                    >
                                                        Edit
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(cost.id)}
                                                        className="text-red-400 hover:text-red-300"
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
        </AuthenticatedLayout>
    );
}
