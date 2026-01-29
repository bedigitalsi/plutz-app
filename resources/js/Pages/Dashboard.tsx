import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

interface UpcomingGig {
    id: number;
    public_id: string;
    performance_date: string;
    location_name: string | null;
    contact_person: string | null;
    status: string;
    price_amount: string | null;
    currency: string | null;
    performance_type?: { name: string } | null;
    band_size?: { label: string } | null;
}

interface Props {
    inquiryStats: {
        pending: number;
        confirmed: number;
        rejected: number;
        total: number;
    };
    inquiryTotals: {
        total: number;
        pending: number;
        confirmed: number;
        rejected: number;
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
    userStats?: {
        total_received: number;
        monthly: { month: string; total: number }[];
    } | null;
    upcomingGigs: UpcomingGig[];
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
}

export default function Dashboard({ inquiryStats, inquiryTotals, incomeStats, expenseStats, mutualFund, groupCostStats, userStats, upcomingGigs, filters }: Props) {
    const [dateFrom, setDateFrom] = useState<string>(filters.date_from || '');
    const [dateTo, setDateTo] = useState<string>(filters.date_to || '');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        setDateFrom(filters.date_from || '');
        setDateTo(filters.date_to || '');
    }, [filters.date_from, filters.date_to]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
        if (filters.date_from && filters.date_to) return `${filters.date_from} → ${filters.date_to}`;
        if (filters.date_from) return `From ${filters.date_from}`;
        if (filters.date_to) return `Up to ${filters.date_to}`;
        return 'All time';
    };

    const nextGig = upcomingGigs.find(g => g.status === 'confirmed');
    const totalExpenses = expenseStats.total + groupCostStats.paid;
    const groupPct = totalExpenses > 0 ? Math.round((groupCostStats.paid / totalExpenses) * 100) : 0;
    const directPct = totalExpenses > 0 ? Math.round((expenseStats.total / totalExpenses) * 100) : 0;

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Dashboard" />

            <main className="max-w-[1200px] mx-auto w-full p-6 flex-grow">
                {/* Filter toggle */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-stone-500 text-sm">{getShowingLabel()}</p>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-plutz-tan hover:text-plutz-tan-light text-sm font-medium uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        Filter
                    </button>
                </div>

                {/* Collapsible Date Filters */}
                {showFilters && (
                    <div className="mb-8 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_from" className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">From</label>
                                <input
                                    type="date"
                                    id="date_from"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan text-sm"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_to" className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">To</label>
                                <input
                                    type="date"
                                    id="date_to"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={applyFilters} disabled={!!isInvalidRange} className="rounded-xl bg-plutz-tan px-4 py-2 text-sm font-bold text-plutz-dark hover:bg-plutz-tan-light disabled:opacity-40 disabled:cursor-not-allowed transition uppercase tracking-wider">Apply</button>
                                <button onClick={clearFilters} className="rounded-xl bg-plutz-tan/20 px-4 py-2 text-sm font-bold text-plutz-tan hover:bg-plutz-tan/30 border border-plutz-tan/20 transition uppercase tracking-wider">Clear</button>
                            </div>
                        </div>
                        {isInvalidRange && <p className="mt-2 text-sm text-red-400">"From" must be before "To"</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: 'All' },
                                { key: 'this-month', label: 'This Month' },
                                { key: 'this-year', label: 'This Year' },
                                { key: 'last-30', label: 'Last 30 Days' },
                                { key: 'last-365', label: 'Last 365 Days' },
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => applyPreset(key)} className="rounded-lg bg-plutz-dark px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-plutz-cream hover:bg-stone-800 transition">
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {/* Pending Inquiries */}
                    <Link
                        href={route('inquiries.index', { status: 'pending', ...dateParams })}
                        className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">Pending Inquiries</p>
                            <span className="material-symbols-outlined text-plutz-tan">mail</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.pending}</p>
                        {inquiryTotals.pending > 0 && (
                            <div className="mt-2 text-xs text-plutz-tan font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {formatMoney(inquiryTotals.pending)} EUR potential
                            </div>
                        )}
                    </Link>

                    {/* Confirmed Gigs */}
                    <Link
                        href={route('inquiries.index', { status: 'confirmed', ...dateParams })}
                        className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">Confirmed Gigs</p>
                            <span className="material-symbols-outlined text-plutz-tan">event_available</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.confirmed}</p>
                        <div className="mt-2 text-xs text-stone-400 font-medium">
                            {nextGig ? `Next: ${formatDate(nextGig.performance_date)}` : 'No upcoming'}
                        </div>
                    </Link>

                    {/* Total Income */}
                    <Link
                        href={route('incomes.index', dateParams)}
                        className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">Total Income</p>
                            <span className="material-symbols-outlined text-plutz-tan">payments</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">
                            {formatMoney(incomeStats.total)} <span className="text-xl font-normal opacity-70">EUR</span>
                        </p>
                        {incomeStats.total > 0 && (
                            <div className="mt-2 text-xs text-green-500 font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {incomeStats.count} income(s)
                            </div>
                        )}
                    </Link>

                    {/* Mutual Fund */}
                    <div className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">Mutual Fund</p>
                            <span className="material-symbols-outlined text-plutz-tan">account_balance_wallet</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">
                            {formatMoney(mutualFund.balance)} <span className="text-xl font-normal opacity-70">EUR</span>
                        </p>
                        <div className="mt-2 text-xs text-stone-400 font-medium">Shared band savings</div>
                    </div>
                </div>

                {/* Main Grid: Upcoming Gigs + Financial Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Upcoming Gigs Column — 2/3 */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-2xl font-serif text-plutz-cream">Upcoming Gigs</h2>
                            <Link
                                href={route('inquiries.index', dateParams)}
                                className="text-plutz-tan hover:underline text-sm font-medium uppercase tracking-wider"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="bg-plutz-surface rounded-xl border border-plutz-tan/10 overflow-hidden shadow-sm">
                            {upcomingGigs.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-stone-900/50 border-b border-plutz-tan/10">
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Date</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Venue</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">Status</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100/5 dark:divide-plutz-tan/5">
                                        {upcomingGigs.map((gig) => (
                                            <tr key={gig.id} className="hover:bg-plutz-tan/5 transition-colors">
                                                <td className="px-6 py-5 text-plutz-cream font-medium">{formatDate(gig.performance_date)}</td>
                                                <td className="px-6 py-5 text-stone-300">{gig.location_name || gig.contact_person || '—'}</td>
                                                <td className="px-6 py-5">
                                                    {gig.status === 'confirmed' ? (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-plutz-tan text-plutz-dark">
                                                            Confirmed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-5 text-right">
                                                    <Link
                                                        href={route('inquiries.show', gig.id)}
                                                        className="material-symbols-outlined text-stone-400 hover:text-plutz-tan transition-colors"
                                                    >
                                                        more_vert
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-12 text-center">
                                    <span className="material-symbols-outlined text-stone-600 text-4xl mb-3 block">event_busy</span>
                                    <p className="text-stone-500 text-sm">No upcoming gigs scheduled</p>
                                    <Link href={route('inquiries.create')} className="mt-3 inline-block text-plutz-tan hover:text-plutz-tan-light text-sm font-medium transition-colors">
                                        + Add an inquiry
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Overview Column — 1/3 */}
                    <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-2xl font-serif text-plutz-cream">Financial Overview</h2>
                        </div>
                        <div className="bg-plutz-surface rounded-xl border border-plutz-tan/10 p-6 shadow-sm">
                            <div className="space-y-6">
                                {/* Revenue */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-green-500 text-lg">arrow_upward</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-plutz-cream">Revenue</p>
                                            <p className="text-xs text-stone-400">{incomeStats.count} income(s)</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-plutz-cream">+{formatMoney(incomeStats.total)} EUR</p>
                                </div>

                                {/* Expenses */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-red-500 text-lg">arrow_downward</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-plutz-cream">Expenses</p>
                                            <p className="text-xs text-stone-400">{expenseStats.count} expense(s)</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-plutz-cream">-{formatMoney(expenseStats.total)} EUR</p>
                                </div>

                                {/* Expense Categories */}
                                {(groupCostStats.count > 0 || expenseStats.count > 0) && (
                                    <div className="pt-6 border-t border-plutz-tan/5">
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-4">Expense Categories</p>
                                        <div className="space-y-4">
                                            {groupCostStats.paid > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-stone-500">Group Costs</span>
                                                        <span className="text-plutz-cream">{groupPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-stone-800 rounded-full h-1.5">
                                                        <div className="bg-plutz-tan h-1.5 rounded-full" style={{ width: `${groupPct}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            {expenseStats.total > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-stone-500">Direct Expenses</span>
                                                        <span className="text-plutz-cream">{directPct}%</span>
                                                    </div>
                                                    <div className="w-full bg-stone-800 rounded-full h-1.5">
                                                        <div className="bg-plutz-tan/60 h-1.5 rounded-full" style={{ width: `${directPct}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                            {groupCostStats.unpaid > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-stone-500">Unpaid</span>
                                                        <span className="text-amber-400">{formatMoney(groupCostStats.unpaid)} EUR</span>
                                                    </div>
                                                    <div className="w-full bg-stone-800 rounded-full h-1.5">
                                                        <div className="bg-plutz-tan/30 h-1.5 rounded-full" style={{ width: `${totalExpenses > 0 ? Math.round((groupCostStats.unpaid / totalExpenses) * 100) : 0}%` }}></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Invoicing */}
                                {incomeStats.count > 0 && (
                                    <div className="pt-6 border-t border-plutz-tan/5">
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">Invoicing</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-500">With invoice</span>
                                                <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.with_invoice)} EUR</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-500">Without invoice</span>
                                                <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.without_invoice)} EUR</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* User Personal Stats */}
                {userStats && (
                    <div className="mb-12 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-plutz-tan mb-3 uppercase tracking-wider">Your Earnings</h3>
                        <p className="text-2xl font-bold text-plutz-cream">
                            {formatMoney(userStats.total_received)} <span className="text-lg font-normal opacity-70">EUR</span>
                        </p>
                        {userStats.monthly && userStats.monthly.length > 0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto">
                                {userStats.monthly.map(m => (
                                    <div key={m.month} className="flex-shrink-0 bg-plutz-dark rounded-lg px-3 py-2 text-center min-w-[70px]">
                                        <p className="text-xs text-stone-500">{m.month}</p>
                                        <p className="text-sm font-bold text-plutz-cream mt-1">{formatMoney(m.total)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Fixed Bottom Quick Actions */}
            <div className="fixed bottom-0 sm:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1200px] px-0 sm:px-6 z-50">
                <div className="bg-plutz-surface/95 sm:bg-plutz-surface/80 backdrop-blur-xl border-t sm:border border-plutz-tan/20 p-2 sm:p-3 sm:rounded-2xl shadow-2xl flex items-center justify-center gap-2 sm:gap-4">
                    <Link
                        href={route('inquiries.create')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-plutz-tan hover:bg-plutz-tan/90 transition-all text-plutz-dark px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest"
                    >
                        <span className="material-symbols-outlined text-base sm:text-lg">add_circle</span>
                        New Inquiry
                    </Link>
                    <Link
                        href={route('expenses.create')}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-3 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest border border-plutz-tan/20"
                    >
                        <span className="material-symbols-outlined text-base sm:text-lg">receipt_long</span>
                        Add Expense
                    </Link>
                    <Link
                        href={route('incomes.create')}
                        className="hidden sm:flex items-center gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest border border-plutz-tan/20"
                    >
                        <span className="material-symbols-outlined text-lg">account_balance</span>
                        Add Income
                    </Link>
                    <Link
                        href={route('calendar.index')}
                        className="sm:hidden flex-shrink-0 flex items-center justify-center bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan p-2.5 rounded-lg border border-plutz-tan/20"
                    >
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                    </Link>
                </div>
            </div>

            {/* Content padding for fixed actions */}
            <div className="h-24"></div>
        </AuthenticatedLayout>
    );
}
