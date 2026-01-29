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

    const netProfit = incomeStats.total - expenseStats.total;
    const totalExpenses = expenseStats.total + groupCostStats.paid;
    const travelPct = totalExpenses > 0 ? Math.round((groupCostStats.paid / totalExpenses) * 100) : 0;
    const directPct = totalExpenses > 0 ? Math.round((expenseStats.total / totalExpenses) * 100) : 0;

    const nextGig = upcomingGigs.find(g => g.status === 'confirmed');

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Dashboard" />

            <div className="min-h-screen bg-plutz-dark">
                {/* Hero Header */}
                <div className="bg-gradient-to-b from-plutz-dark to-plutz-surface px-4 sm:px-6 lg:px-8 pt-8 pb-2">
                    <div className="mx-auto max-w-[1200px]">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <h1 className="font-serif text-3xl text-plutz-cream">Dashboard</h1>
                                <p className="text-plutz-warm-gray text-sm mt-1">{getShowingLabel()}</p>
                            </div>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 text-plutz-tan hover:text-plutz-tan-light text-sm font-medium uppercase tracking-wider transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                Filter
                            </button>
                        </div>

                        {/* Collapsible Date Filters */}
                        {showFilters && (
                            <div className="mt-4 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-5 mb-6">
                                <div className="flex flex-wrap items-end gap-4">
                                    <div className="flex-1 min-w-[150px]">
                                        <label htmlFor="date_from" className="block text-xs font-medium text-plutz-warm-gray mb-1 uppercase tracking-wider">From</label>
                                        <input
                                            type="date"
                                            id="date_from"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan text-sm"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-[150px]">
                                        <label htmlFor="date_to" className="block text-xs font-medium text-plutz-warm-gray mb-1 uppercase tracking-wider">To</label>
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
                                        <button key={key} onClick={() => applyPreset(key)} className="rounded-lg bg-plutz-dark px-3 py-1.5 text-xs font-medium text-plutz-warm-gray hover:text-plutz-cream hover:bg-plutz-brown/50 transition">
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 pb-32">
                    <div className="mx-auto max-w-[1200px]">
                        {/* Stat Cards Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            {/* Pending Inquiries */}
                            <Link href={route('inquiries.index', { status: 'pending', ...dateParams })} className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-plutz-warm-gray text-xs font-medium uppercase tracking-wider">Pending</p>
                                    <svg className="w-5 h-5 text-plutz-tan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.pending}</p>
                                {inquiryTotals.pending > 0 && (
                                    <div className="mt-2 text-xs text-plutz-tan font-medium flex items-center gap-1">
                                        {formatMoney(inquiryTotals.pending)} EUR potential
                                    </div>
                                )}
                            </Link>

                            {/* Confirmed Gigs */}
                            <Link href={route('inquiries.index', { status: 'confirmed', ...dateParams })} className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-plutz-warm-gray text-xs font-medium uppercase tracking-wider">Confirmed</p>
                                    <svg className="w-5 h-5 text-plutz-tan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.confirmed}</p>
                                {nextGig && (
                                    <div className="mt-2 text-xs text-plutz-warm-gray font-medium">
                                        Next: {formatDate(nextGig.performance_date)}
                                    </div>
                                )}
                            </Link>

                            {/* Total Income */}
                            <Link href={route('incomes.index', dateParams)} className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors group">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-plutz-warm-gray text-xs font-medium uppercase tracking-wider">Total Income</p>
                                    <svg className="w-5 h-5 text-plutz-tan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-plutz-cream">
                                    {formatMoney(incomeStats.total)} <span className="text-xl font-normal opacity-70">EUR</span>
                                </p>
                                {netProfit > 0 && (
                                    <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                                        Net +{formatMoney(netProfit)} EUR
                                    </div>
                                )}
                            </Link>

                            {/* Mutual Fund */}
                            <div className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-plutz-warm-gray text-xs font-medium uppercase tracking-wider">Mutual Fund</p>
                                    <svg className="w-5 h-5 text-plutz-tan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-3xl font-bold text-plutz-cream">
                                    {formatMoney(mutualFund.balance)} <span className="text-xl font-normal opacity-70">EUR</span>
                                </p>
                                <div className="mt-2 text-xs text-plutz-warm-gray font-medium">Shared band savings</div>
                            </div>
                        </div>

                        {/* Main Content: Gigs + Financial */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                            {/* Upcoming Gigs — 2 cols */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="font-serif text-2xl text-plutz-cream">Upcoming Gigs</h2>
                                    <Link href={route('inquiries.index', { status: 'confirmed', ...dateParams })} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium uppercase tracking-wider transition-colors">
                                        View All
                                    </Link>
                                </div>
                                <div className="bg-plutz-surface rounded-xl border border-plutz-tan/10 overflow-hidden shadow-sm">
                                    {upcomingGigs.length > 0 ? (
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-plutz-dark/50 border-b border-plutz-tan/10">
                                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-plutz-warm-gray">Date</th>
                                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-plutz-warm-gray">Venue</th>
                                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-plutz-warm-gray">Status</th>
                                                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-plutz-warm-gray text-right">Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-plutz-tan/5">
                                                {upcomingGigs.map((gig) => (
                                                    <tr key={gig.id} className="hover:bg-plutz-tan/5 transition-colors">
                                                        <td className="px-6 py-5 text-plutz-cream font-medium">{formatDate(gig.performance_date)}</td>
                                                        <td className="px-6 py-5 text-plutz-warm-gray">{gig.location_name || gig.contact_person || '—'}</td>
                                                        <td className="px-6 py-5">
                                                            {gig.status === 'confirmed' ? (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-plutz-tan text-plutz-dark">
                                                                    Confirmed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-plutz-warm-gray/20 text-plutz-warm-gray border border-plutz-warm-gray/30">
                                                                    Pending
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-5 text-right text-plutz-cream font-medium">
                                                            {gig.price_amount ? `${formatMoney(parseFloat(gig.price_amount))} ${gig.currency || 'EUR'}` : '—'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="p-12 text-center">
                                            <p className="text-plutz-warm-gray text-sm">No upcoming gigs scheduled</p>
                                            <Link href={route('inquiries.create')} className="mt-3 inline-block text-plutz-tan hover:text-plutz-tan-light text-sm font-medium transition-colors">
                                                + Add an inquiry
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Financial Overview — 1 col */}
                            <div className="lg:col-span-1">
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <h2 className="font-serif text-2xl text-plutz-cream">Financial Overview</h2>
                                </div>
                                <div className="bg-plutz-surface rounded-xl border border-plutz-tan/10 p-6 shadow-sm">
                                    <div className="space-y-6">
                                        {/* Revenue */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-plutz-cream">Revenue</p>
                                                    <p className="text-xs text-plutz-warm-gray">{incomeStats.count} income(s)</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-plutz-cream">+{formatMoney(incomeStats.total)} EUR</p>
                                        </div>

                                        {/* Expenses */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-plutz-cream">Expenses</p>
                                                    <p className="text-xs text-plutz-warm-gray">{expenseStats.count} expense(s)</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-plutz-cream">-{formatMoney(expenseStats.total)} EUR</p>
                                        </div>

                                        {/* Breakdown */}
                                        {(groupCostStats.count > 0 || expenseStats.count > 0) && (
                                            <div className="pt-6 border-t border-plutz-tan/5">
                                                <p className="text-xs text-plutz-warm-gray uppercase tracking-widest mb-4">Expense Breakdown</p>
                                                <div className="space-y-4">
                                                    {groupCostStats.paid > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-plutz-warm-gray">Group Costs (Paid)</span>
                                                                <span className="text-plutz-cream">{travelPct}%</span>
                                                            </div>
                                                            <div className="w-full bg-plutz-dark rounded-full h-1.5">
                                                                <div className="bg-plutz-tan h-1.5 rounded-full transition-all" style={{ width: `${travelPct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {expenseStats.total > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-plutz-warm-gray">Direct Expenses</span>
                                                                <span className="text-plutz-cream">{directPct}%</span>
                                                            </div>
                                                            <div className="w-full bg-plutz-dark rounded-full h-1.5">
                                                                <div className="bg-plutz-tan/60 h-1.5 rounded-full transition-all" style={{ width: `${directPct}%` }}></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {groupCostStats.unpaid > 0 && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-plutz-warm-gray">Unpaid Group Costs</span>
                                                                <span className="text-amber-400">{formatMoney(groupCostStats.unpaid)} EUR</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Invoice breakdown */}
                                        {incomeStats.count > 0 && (
                                            <div className="pt-6 border-t border-plutz-tan/5">
                                                <p className="text-xs text-plutz-warm-gray uppercase tracking-widest mb-3">Invoicing</p>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-plutz-warm-gray">With invoice</span>
                                                    <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.with_invoice)} EUR</span>
                                                </div>
                                                <div className="flex justify-between text-sm mt-1">
                                                    <span className="text-plutz-warm-gray">Without invoice</span>
                                                    <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.without_invoice)} EUR</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* User Personal Stats (if band member) */}
                        {userStats && (
                            <div className="mb-8 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-6 shadow-sm">
                                <h3 className="text-sm font-semibold text-plutz-tan mb-3 uppercase tracking-wider">Your Earnings</h3>
                                <p className="text-2xl font-bold text-plutz-cream">{formatMoney(userStats.total_received)} <span className="text-lg font-normal opacity-70">EUR</span></p>
                                {userStats.monthly && userStats.monthly.length > 0 && (
                                    <div className="mt-4 flex gap-3 overflow-x-auto">
                                        {userStats.monthly.map(m => (
                                            <div key={m.month} className="flex-shrink-0 bg-plutz-dark rounded-lg px-3 py-2 text-center min-w-[70px]">
                                                <p className="text-xs text-plutz-warm-gray">{m.month}</p>
                                                <p className="text-sm font-bold text-plutz-cream mt-1">{formatMoney(m.total)}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Fixed Bottom Quick Actions */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-[1200px] px-6 z-50">
                    <div className="bg-plutz-surface/80 backdrop-blur-xl border border-plutz-tan/20 p-3 rounded-2xl shadow-2xl flex items-center justify-center gap-3 flex-wrap">
                        <Link href={route('inquiries.create')} className="flex items-center gap-2 bg-plutz-tan hover:bg-plutz-tan-light transition-all text-plutz-dark px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            New Inquiry
                        </Link>
                        <Link href={route('expenses.create')} className="flex items-center gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-plutz-tan/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" /></svg>
                            Add Expense
                        </Link>
                        <Link href={route('incomes.create')} className="flex items-center gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-plutz-tan/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            Add Income
                        </Link>
                        <Link href={route('group-costs.create')} className="flex items-center gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-widest border border-plutz-tan/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                            Group Cost
                        </Link>
                    </div>
                </div>

                {/* Spacer for fixed action bar */}
                <div className="h-24"></div>
            </div>
        </AuthenticatedLayout>
    );
}
