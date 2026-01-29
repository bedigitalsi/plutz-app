import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Income {
    id: number;
    income_date: string;
    amount: number;
    currency: string;
    invoice_issued: boolean;
    contact_person: string;
    performance_type: {
        name: string;
    };
    inquiry?: {
        id: number;
        location_name: string;
    };
    distributions: any[];
}

interface PerformanceType {
    id: number;
    name: string;
}

interface Props {
    incomes: {
        data: Income[];
        links: any[];
    };
    performanceTypes: PerformanceType[];
    filters: any;
}

export default function Index({ incomes, performanceTypes, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [performanceTypeId, setPerformanceTypeId] = useState(filters.performance_type_id || '');

    const handleFilter = () => {
        router.get(route('incomes.index'), 
            { date_from: dateFrom, date_to: dateTo, performance_type_id: performanceTypeId }, 
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

    const getTotalIncome = () => {
        return incomes.data.reduce((sum, income) => sum + parseFloat(income.amount.toString()), 0).toFixed(2);
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Income" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Income</h2>
                    <Link href={route('incomes.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">New Income</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                <label className="block text-sm font-medium text-stone-400">Performance Type</label>
                                <select
                                    value={performanceTypeId}
                                    onChange={(e) => setPerformanceTypeId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                >
                                    <option value="">All</option>
                                    {performanceTypes.map((type) => (
                                        <option key={type.id} value={type.id}>{type.name}</option>
                                    ))}
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
                    {incomes.data.length > 0 && (
                        <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-stone-400">Total Income</p>
                                    <p className="text-2xl font-bold text-green-400">{getTotalIncome()} EUR</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-400">Count</p>
                                    <p className="text-2xl font-bold text-plutz-cream">{incomes.data.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Income List */}
                    {incomes.data.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No income records found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Contact/Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                    {incomes.data.map((income) => (
                                        <tr key={income.id} className="hover:bg-stone-900/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-plutz-cream">
                                                {formatDate(income.income_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-plutz-cream">
                                                <div>
                                                    <p className="font-medium">{income.contact_person}</p>
                                                    {income.inquiry && (
                                                        <p className="text-xs text-stone-500">{income.inquiry.location_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {income.performance_type.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-400">
                                                {parseFloat(income.amount.toString()).toFixed(2)} {income.currency}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    {income.invoice_issued && (
                                                        <span className="inline-flex rounded-full bg-plutz-tan/20 px-2 py-1 text-xs text-plutz-tan">
                                                            Invoice
                                                        </span>
                                                    )}
                                                    {income.distributions.length > 0 && (
                                                        <span className="inline-flex rounded-full bg-green-500/100/10 px-2 py-1 text-xs text-green-400">
                                                            Distributed
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={route('incomes.show', income.id)}
                                                    className="text-plutz-tan hover:text-plutz-tan"
                                                >
                                                    View
                                                </Link>
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
