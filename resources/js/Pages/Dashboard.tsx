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
    // Local state for date inputs, initialized from server filters
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to || '');

    // Keep local state in sync with server filters (supports browser back/forward)
    useEffect(() => {
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
    }, [filters.date_from, filters.date_to]);

    const formatMoney = (amount: number, currency: string = 'EUR') => {
        return `${parseFloat(amount.toString()).toFixed(2)} ${currency}`;
    };

    // Helper to build date params object (only includes non-empty values)
    const buildDateParams = (from: string, to: string) => {
        const params: { date_from?: string; date_to?: string } = {};
        if (from) params.date_from = from;
        if (to) params.date_to = to;
        return params;
    };

    // Active date params for propagating to links
    const dateParams = buildDateParams(filters.date_from || '', filters.date_to || '');

    // Apply filters via Inertia
    const applyFilters = () => {
        const params = buildDateParams(dateFrom, dateTo);
        router.get(route('dashboard'), params, { preserveScroll: true, replace: true });
    };

    // Clear filters
    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        router.get(route('dashboard'), {}, { preserveScroll: true, replace: true });
    };

    // Preset buttons
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

    // Check if range is invalid (from > to)
    const isInvalidRange = dateFrom && dateTo && dateFrom > dateTo;

    // Generate "Showing:" label
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
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Date Filter Bar */}
                    <div className="mb-8 rounded-lg bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Date Filter</h3>
                            <span className="text-sm text-gray-600">Showing: {getShowingLabel()}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-end gap-4">
                            {/* Date inputs */}
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_from" className="block text-sm font-medium text-gray-700 mb-1">
                                    From
                                </label>
                                <input
                                    type="date"
                                    id="date_from"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_to" className="block text-sm font-medium text-gray-700 mb-1">
                                    To
                                </label>
                                <input
                                    type="date"
                                    id="date_to"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Apply and Clear buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={applyFilters}
                                    disabled={!!isInvalidRange}
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        {/* Validation message */}
                        {isInvalidRange && (
                            <p className="mt-2 text-sm text-red-600">
                                "From" date must be before or equal to "To" date
                            </p>
                        )}

                        {/* Preset buttons */}
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button
                                onClick={() => applyPreset('all')}
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                All
                            </button>
                            <button
                                onClick={() => applyPreset('this-month')}
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => applyPreset('this-year')}
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                This Year
                            </button>
                            <button
                                onClick={() => applyPreset('last-30')}
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Last 30 Days
                            </button>
                            <button
                                onClick={() => applyPreset('last-365')}
                                className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
                            >
                                Last 365 Days
                            </button>
                        </div>
                    </div>

                    {/* Inquiries Section */}
                    <div className="mb-8">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Inquiries</h3>
                            <Link
                                href={route('inquiries.index', dateParams)}
                                className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                                View All →
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Link
                                href={route('inquiries.index', { status: 'pending', ...dateParams })}
                                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
                            >
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-yellow-600">{inquiryStats.pending}</p>
                            </Link>
                            <Link
                                href={route('inquiries.index', { status: 'confirmed', ...dateParams })}
                                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
                            >
                                <p className="text-sm text-gray-600">Confirmed</p>
                                <p className="text-3xl font-bold text-green-600">{inquiryStats.confirmed}</p>
                            </Link>
                            <Link
                                href={route('inquiries.index', { status: 'rejected', ...dateParams })}
                                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
                            >
                                <p className="text-sm text-gray-600">Rejected</p>
                                <p className="text-3xl font-bold text-red-600">{inquiryStats.rejected}</p>
                            </Link>
                            <div className="rounded-lg bg-white p-6 shadow-sm">
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-3xl font-bold text-gray-900">{inquiryStats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Financial Overview Section */}
                    <div className="mb-8">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Financial Overview</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Link
                                href={route('incomes.index', dateParams)}
                                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
                            >
                                <p className="text-sm text-gray-600">Total Income</p>
                                <p className="text-3xl font-bold text-green-600">
                                    {formatMoney(incomeStats.total)}
                                </p>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Count: {incomeStats.count} income(s)</p>
                                    <p>With invoice: {formatMoney(incomeStats.with_invoice)}</p>
                                </div>
                            </Link>
                            <Link
                                href={route('expenses.index', dateParams)}
                                className="block rounded-lg bg-white p-6 shadow-sm hover:shadow-md"
                            >
                                <p className="text-sm text-gray-600">Total Expenses</p>
                                <p className="text-3xl font-bold text-red-600">
                                    {formatMoney(expenseStats.total)}
                                </p>
                                <div className="mt-2 text-xs text-gray-500">
                                    <p>Count: {expenseStats.count} expense(s)</p>
                                </div>
                            </Link>
                            <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 text-white shadow-sm">
                                <p className="text-sm text-indigo-100">Mutual Fund Balance</p>
                                <p className="text-3xl font-bold">
                                    {formatMoney(mutualFund.balance)}
                                </p>
                                <div className="mt-2 text-xs text-indigo-100">
                                    <p>Inflow: {formatMoney(mutualFund.inflow)}</p>
                                    <p>Outflow: {formatMoney(mutualFund.outflow)}</p>
                                </div>
                                <Link
                                    href={route('group-costs.index', dateParams)}
                                    className="mt-2 inline-block text-xs text-indigo-100 hover:text-white"
                                >
                                    View Group Costs →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Group Costs Summary */}
                    {groupCostStats.count > 0 && (
                        <div className="rounded-lg bg-blue-50 p-6 shadow-sm">
                            <h3 className="text-sm font-medium text-blue-800 mb-2">
                                Group Costs Summary
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-sm text-blue-700">
                                <div>
                                    <p className="font-semibold">Paid</p>
                                    <p>{formatMoney(groupCostStats.paid)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Unpaid</p>
                                    <p>{formatMoney(groupCostStats.unpaid)}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Total Costs</p>
                                    <p>{groupCostStats.count} cost(s)</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-8">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <Link
                                href={route('inquiries.create')}
                                className="rounded-lg bg-white p-4 text-center shadow-sm hover:shadow-md"
                            >
                                <div className="text-2xl">📝</div>
                                <p className="mt-2 text-sm font-medium text-gray-900">New Inquiry</p>
                            </Link>
                            <Link
                                href={route('incomes.create')}
                                className="rounded-lg bg-white p-4 text-center shadow-sm hover:shadow-md"
                            >
                                <div className="text-2xl">💰</div>
                                <p className="mt-2 text-sm font-medium text-gray-900">Add Income</p>
                            </Link>
                            <Link
                                href={route('expenses.create')}
                                className="rounded-lg bg-white p-4 text-center shadow-sm hover:shadow-md"
                            >
                                <div className="text-2xl">🧾</div>
                                <p className="mt-2 text-sm font-medium text-gray-900">Add Expense</p>
                            </Link>
                            <Link
                                href={route('group-costs.create')}
                                className="rounded-lg bg-white p-4 text-center shadow-sm hover:shadow-md"
                            >
                                <div className="text-2xl">💸</div>
                                <p className="mt-2 text-sm font-medium text-gray-900">Group Cost</p>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
