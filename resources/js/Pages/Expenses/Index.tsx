import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Expense {
    id: number;
    invoice_date: string;
    amount: number;
    currency: string;
    company_name: string;
    notes?: string;
    status: string;
    creator: {
        name: string;
    };
    attachments: any[];
}

interface Props {
    expenses: {
        data: Expense[];
        links: any[];
    };
    filters: {
        date_from?: string;
        date_to?: string;
        company?: string;
    };
}

export default function Index({ expenses, filters }: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [company, setCompany] = useState(filters.company || '');

    const handleFilter = () => {
        router.get(route('expenses.index'), { date_from: dateFrom, date_to: dateTo, company }, { preserveState: true });
    };

    const handleReset = () => {
        setDateFrom('');
        setDateTo('');
        setCompany('');
        router.get(route('expenses.index'));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getTotalExpenses = () => {
        return expenses.data.reduce((sum, expense) => sum + parseFloat(expense.amount.toString()), 0).toFixed(2);
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Expenses" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Expenses</h2>
                    <Link href={route('expenses.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">New Expense</Link>
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
                                <label className="block text-sm font-medium text-stone-400">Company</label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Search company..."
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button
                                onClick={handleFilter}
                                className="rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90"
                            >
                                Apply Filters
                            </button>
                            <button
                                onClick={handleReset}
                                className="rounded-md bg-plutz-tan/20 px-4 py-2 text-sm font-semibold text-stone-400 hover:bg-plutz-tan/30"
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    {/* Summary */}
                    {expenses.data.length > 0 && (
                        <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-stone-400">Total Expenses</p>
                                    <p className="text-2xl font-bold text-plutz-cream">{getTotalExpenses()} EUR</p>
                                </div>
                                <div>
                                    <p className="text-sm text-stone-400">Count</p>
                                    <p className="text-2xl font-bold text-plutz-cream">{expenses.data.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expenses List */}
                    {expenses.data.length === 0 ? (
                        <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                            <p className="text-stone-500">No expenses found.</p>
                            <Link
                                href={route('expenses.create')}
                                className="mt-4 inline-block text-plutz-tan hover:text-plutz-tan"
                            >
                                Create your first expense
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Attachments
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Created By
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                    {expenses.data.map((expense) => (
                                        <tr key={expense.id} className="hover:bg-stone-900/50">
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-plutz-cream">
                                                {formatDate(expense.invoice_date)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-plutz-cream">
                                                {expense.company_name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-plutz-cream">
                                                {parseFloat(expense.amount.toString()).toFixed(2)} {expense.currency}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {expense.attachments.length > 0 && (
                                                    <span className="inline-flex items-center rounded-full bg-plutz-tan/20 px-2 py-1 text-xs text-plutz-tan">
                                                        <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                        </svg>
                                                        {expense.attachments.length}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">
                                                {expense.creator.name}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                                                <Link
                                                    href={route('expenses.show', expense.id)}
                                                    className="text-plutz-tan hover:text-plutz-tan"
                                                >
                                                    View
                                                </Link>
                                                <span className="mx-2 text-stone-600">|</span>
                                                <Link
                                                    href={route('expenses.edit', expense.id)}
                                                    className="text-plutz-tan hover:text-plutz-tan"
                                                >
                                                    Edit
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
