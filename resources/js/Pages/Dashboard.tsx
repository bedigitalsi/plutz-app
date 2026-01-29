import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface Props {
    inquiryStats: {
        pending: number;
        confirmed: number;
        rejected: number;
        total: number;
    };
    incomeStats: {
        total: number;
        with_invoice: number;
        without_invoice: number;
        count: number;
    };
    expenseStats: {
        total: number;
        count: number;
    };
    mutualFund: {
        inflow: number;
        outflow: number;
        balance: number;
    };
    groupCostStats: {
        paid: number;
        unpaid: number;
        count: number;
    };
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
}

export default function Dashboard({ inquiryStats, incomeStats, expenseStats, mutualFund, groupCostStats, filters }: Props) {
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to || '');

    useEffect(() => {
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
    }, [filters.date_from, filters.date_to]);

    const formatMoney = (amount: number, currency: string = 'EUR') => {
        return `${parseFloat(amount.toString()).toFixed(2)} ${currency}`;
    };

    const buildDateParams = (from: string, to: string) => {
        const params: { date_from?: string; date_to?: string } = {};
        if (from) params.date_from = from;
        if (to) params.date_to = to;
        return params;
    };

    const dateParams = buildDateParams(filters.date_from || '', filters.date_to || '');

    const applyFilters = () => {
        const params = buildDateParams(dateFrom, dateTo);
        router.get(route('dashboard'), params, { preserveScroll: true, replace: true });
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        router.get(route('dashboard'), {}, { preserveScroll: true, replace: true });
    };

    const applyPreset = (preset: string) => {
        const today = new Date();
        let from = '';
        let to = '';

        switch (preset) {
            case 'all':
                clearFilters();
                return;
            case 'this-month':
                from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
                to = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
                break;
            case 'this-year':
                from = `${today.getFullYear()}-01-01`;
                to = `${today.getFullYear()}-12-31`;
                break;
            case 'last-30':
                from = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
            case 'last-365':
                from = new Date(today.getTime() - 364 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                to = today.toISOString().split('T')[0];
                break;
        }

        setDateFrom(from);
        setDateTo(to);
        const params = buildDateParams(from, to);
        router.get(route('dashboard'), params, { preserveScroll: true, replace: true });
    };

    const isInvalidRange = dateFrom && dateTo && dateFrom > dateTo;

    const getShowingLabel = () => {
        if (!filters.date_from && !filters.date_to) return 'All time';
        if (filters.date_from && filters.date_to) return `${filters.date_from} to ${filters.date_to}`;
        if (filters.date_from) return `From ${filters.date_from}`;
        if (filters.date_to) return `Up to ${filters.date_to}`;
        return 'All time';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-serif text-2xl font-semibold leading-tight text-plutz-brown">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Date Filter Bar */}
                    <div className="mb-8 rounded-xl bg-white p-6 shadow-warm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-serif text-lg font-semibold text-plutz-brown">Date Filter</h3>
                            <span className="text-sm text-plutz-warm-gray">Showing: {getShowingLabel()}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_from" className="block text-sm font-medium text-plutz-brown mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    id="date_from"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border-plutz-cream-dark bg-plutz-cream shadow-sm focus:border-plutz-teal focus:ring-plutz-teal"
                                />
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_to" className="block text-sm font-medium text-plutz-brown mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    id="date_to"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border-plutz-cream-dark bg-plutz-cream shadow-sm focus:border-plutz-teal focus:ring-plutz-teal"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilters}
                                    disabled={!!isInvalidRange}
                                    className="rounded-xl bg-plutz-teal px-4 py-2 text-sm font-medium text-white hover:bg-plutz-teal-dark focus:outline-none focus:ring-2 focus:ring-plutz-teal focus:ring-offset-2 disabled:bg-plutz-warm-gray/40 disabled:cursor-not-allowed transition duration-150"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="rounded-xl bg-plutz-cream-dark px-4 py-2 text-sm font-medium text-plutz-brown hover:bg-plutz-cream focus:outline-none focus:ring-2 focus:ring-plutz-warm-gray focus:ring-offset-2 transition duration-150"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {isInvalidRange && (
                            <p className="mt-2 text-sm text-red-600">
                                "From" date must be before or equal to "To" date
                            </p>
                        )}

                        <div className="mt-4 flex flex-wrap gap-2">
                            {['all', 'this-month', 'this-year', 'last-30', 'last-365'].map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => applyPreset(preset)}
                                    className="rounded-lg bg-plutz-cream px-3 py-1.5 text-xs font-medium text-plutz-brown hover:bg-plutz-cream-dark transition duration-150"
                                >
                                    {preset === 'all' ? 'All' : preset === 'this-month' ? 'This Month' : preset === 'this-year' ? 'This Year' : preset === 'last-30' ? 'Last 30 Days' : 'Last 365 Days'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Inquiries Section */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-serif text-lg font-semibold text-plutz-brown">Inquiries</h3>
                            <Link
                                href={route('inquiries.index', dateParams)}
                                className="text-sm text-plutz-teal hover:text-plutz-teal-dark font-medium transition duration-150"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Link
                                href={route('inquiries.index', { status: 'pending', ...dateParams })}
                                className="block rounded-xl bg-white p-6 shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-plutz-warm-gray">Pending</p>
                                <p className="text-3xl font-bold text-amber-600">{inquiryStats.pending}</p>
                            </Link>
                            <Link
                                href={route('inquiries.index', { status: 'confirmed', ...dateParams })}
                                className="block rounded-xl bg-white p-6 shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-plutz-warm-gray">Confirmed</p>
                                <p className="text-3xl font-bold text-emerald-600">{inquiryStats.confirmed}</p>
                            </Link>
                            <Link
                                href={route('inquiries.index', { status: 'rejected', ...dateParams })}
                                className="block rounded-xl bg-white p-6 shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-plutz-warm-gray">Rejected</p>
                                <p className="text-3xl font-bold text-red-500">{inquiryStats.rejected}</p>
                            </Link>
                            <div className="rounded-xl bg-white p-6 shadow-warm">
                                <p className="text-sm text-plutz-warm-gray">Total</p>
                                <p className="text-3xl font-bold text-plutz-brown">{inquiryStats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview Section */}
                    <div className="mb-8">
                        <h3 className="mb-4 font-serif text-lg font-semibold text-plutz-brown">Financial Overview</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Link
                                href={route('incomes.index', dateParams)}
                                className="block rounded-xl bg-white p-6 shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-plutz-warm-gray">Total Income</p>
                                <p className="text-3xl font-bold text-emerald-600">
                                    {formatMoney(incomeStats.total)}
                                </p>
                                <div className="mt-3 text-xs text-plutz-warm-gray">
                                    <p>Count: {incomeStats.count} income(s)</p>
                                    <p>With invoice: {formatMoney(incomeStats.with_invoice)}</p>
                                </div>
                            </Link>
                            <Link
                                href={route('expenses.index', dateParams)}
                                className="block rounded-xl bg-white p-6 shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <p className="text-sm text-plutz-warm-gray">Total Expenses</p>
                                <p className="text-3xl font-bold text-red-500">
                                    {formatMoney(expenseStats.total)}
                                </p>
                                <div className="mt-3 text-xs text-plutz-warm-gray">
                                    <p>Count: {expenseStats.count} expense(s)</p>
                                </div>
                            </Link>
                            <div className="rounded-xl bg-gradient-to-br from-plutz-teal to-plutz-accent p-6 text-white shadow-warm">
                                <p className="text-sm text-white/80">Mutual Fund Balance</p>
                                <p className="text-3xl font-bold">
                                    {formatMoney(mutualFund.balance)}
                                </p>
                                <div className="mt-3 text-xs text-white/70">
                                    <p>Inflow: {formatMoney(mutualFund.inflow)}</p>
                                    <p>Outflow: {formatMoney(mutualFund.outflow)}</p>
                                </div>
                                <Link
                                    href={route('group-costs.index', dateParams)}
                                    className="mt-2 inline-block text-xs text-white/80 hover:text-white transition duration-150"
                                >
                                    View Group Costs →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Group Costs Summary */}
                    {groupCostStats.count > 0 && (
                        <div className="rounded-xl bg-plutz-teal/5 border border-plutz-teal/10 p-6 shadow-warm mb-8">
                            <h3 className="text-sm font-semibold text-plutz-accent mb-3">
                                Group Costs Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-sm text-plutz-accent-light">
                                <div>
                                    <p className="font-semibold text-plutz-brown">Paid</p>
                                    <p>{formatMoney(groupCostStats.paid)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-plutz-brown">Unpaid</p>
                                    <p>{formatMoney(groupCostStats.unpaid)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-plutz-brown">Total Costs</p>
                                    <p>{groupCostStats.count} cost(s)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div>
                        <h3 className="mb-4 font-serif text-lg font-semibold text-plutz-brown">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Link
                                href={route('inquiries.create')}
                                className="rounded-xl bg-white p-5 text-center shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <div className="text-2xl">📝</div>
                                <p className="mt-2 text-sm font-medium text-plutz-brown">New Inquiry</p>
                            </Link>
                            <Link
                                href={route('incomes.create')}
                                className="rounded-xl bg-white p-5 text-center shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <div className="text-2xl">💰</div>
                                <p className="mt-2 text-sm font-medium text-plutz-brown">Add Income</p>
                            </Link>
                            <Link
                                href={route('expenses.create')}
                                className="rounded-xl bg-white p-5 text-center shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <div className="text-2xl">🧾</div>
                                <p className="mt-2 text-sm font-medium text-plutz-brown">Add Expense</p>
                            </Link>
                            <Link
                                href={route('group-costs.create')}
                                className="rounded-xl bg-white p-5 text-center shadow-warm hover:shadow-warm-md transition-shadow duration-200"
                            >
                                <div className="text-2xl">💸</div>
                                <p className="mt-2 text-sm font-medium text-plutz-brown">Group Cost</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
