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
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Income
                    </h2>
                    <Link
                        href={route('incomes.create')}
                        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        New Income
                    </Link>
                </div>
            }
        >
            <Head title="Income" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Filters */}
                    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                                <label className="block text-sm font-medium text-gray-700">Performance Type</label>
                                <select
                                    value={performanceTypeId}
                                    onChange={(e) => setPerformanceTypeId(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {incomes.data.length > 0 && (
                        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Income</p>
                                    <p className="text-2xl font-bold text-green-600">{getTotalIncome()} EUR</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Count</p>
                                    <p className="text-2xl font-bold text-gray-900">{incomes.data.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Income List */}
                    {incomes.data.length === 0 ? (
                        <div className="rounded-lg bg-white p-8 text-center shadow-sm">
                            <p className="text-gray-500">No income records found.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact/Event</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {incomes.data.map((income) => (
                                        <tr key={income.id} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {formatDate(income.income_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>
                                                    <p className="font-medium">{income.contact_person}</p>
                                                    {income.inquiry && (
                                                        <p className="text-xs text-gray-500">{income.inquiry.location_name}</p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                {income.performance_type.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-green-600">
                                                {parseFloat(income.amount.toString()).toFixed(2)} {income.currency}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                <div className="flex gap-2">
                                                    {income.invoice_issued && (
                                                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                                                            Invoice
                                                        </span>
                                                    )}
                                                    {income.distributions.length > 0 && (
                                                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">
                                                            Distributed
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={route('incomes.show', income.id)}
                                                    className="text-indigo-600 hover:text-indigo-900"
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
            </div>
        </AuthenticatedLayout>
    );
}
