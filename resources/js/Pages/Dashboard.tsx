import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

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
        total_paid: number;
        total_unpaid: number;
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
    memberBreakdown?: {
        id: number;
        name: string;
        total_distributed: number;
        invoiced_distributed: number;
        total_expenses: number;
    }[] | null;
    upcomingGigs: UpcomingGig[];
    filters: {
        date_from: string | null;
        date_to: string | null;
    };
}

export default function Dashboard({ inquiryStats, inquiryTotals, incomeStats, expenseStats, mutualFund, groupCostStats, userStats, memberBreakdown, upcomingGigs, filters }: Props) {
    const { t, locale } = useTranslation();
    const authProps = usePage().props.auth as any;
    const permissions: string[] = authProps.permissions ?? [];
    const can = (p: string) => permissions.includes(p);
    const hidePrices = authProps.user?.hide_prices;
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
        return date.toLocaleDateString(locale === 'sl' ? 'sl-SI' : 'en-US', { month: 'short', day: 'numeric' });
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
        if (!filters.date_from && !filters.date_to) return t('dashboard.all_time');
        if (filters.date_from && filters.date_to) return `${filters.date_from} → ${filters.date_to}`;
        if (filters.date_from) return `${t('dashboard.from')} ${filters.date_from}`;
        if (filters.date_to) return `Up to ${filters.date_to}`;
        return t('dashboard.all_time');
    };

    const nextGig = upcomingGigs.find(g => g.status === 'confirmed');
    const totalExpenses = expenseStats.total + groupCostStats.paid;
    const groupPct = totalExpenses > 0 ? Math.round((groupCostStats.paid / totalExpenses) * 100) : 0;
    const directPct = totalExpenses > 0 ? Math.round((expenseStats.total / totalExpenses) * 100) : 0;

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('dashboard.title')} />

            <main className="max-w-[1200px] mx-auto w-full p-6 flex-grow">
                {/* Filter toggle */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-stone-500 text-sm">{getShowingLabel()}</p>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 text-plutz-tan hover:text-plutz-tan-light text-sm font-medium uppercase tracking-wider transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">filter_list</span>
                        {t('dashboard.filter')}
                    </button>
                </div>

                {/* Collapsible Date Filters */}
                {showFilters && (
                    <div className="mb-8 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_from" className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">{t('dashboard.from')}</label>
                                <input
                                    type="date"
                                    id="date_from"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan text-sm"
                                />
                            </div>
                            <div className="flex-1 min-w-[150px]">
                                <label htmlFor="date_to" className="block text-xs font-medium text-stone-500 mb-1 uppercase tracking-wider">{t('dashboard.to')}</label>
                                <input
                                    type="date"
                                    id="date_to"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan text-sm"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={applyFilters} disabled={!!isInvalidRange} className="rounded-xl bg-plutz-tan px-4 py-2 text-sm font-bold text-plutz-dark hover:bg-plutz-tan-light disabled:opacity-40 disabled:cursor-not-allowed transition uppercase tracking-wider">{t('dashboard.apply')}</button>
                                <button onClick={clearFilters} className="rounded-xl bg-plutz-tan/20 px-4 py-2 text-sm font-bold text-plutz-tan hover:bg-plutz-tan/30 border border-plutz-tan/20 transition uppercase tracking-wider">{t('dashboard.clear')}</button>
                            </div>
                        </div>
                        {isInvalidRange && <p className="mt-2 text-sm text-red-400">{t('dashboard.from_must_be_before_to')}</p>}
                        <div className="mt-3 flex flex-wrap gap-2">
                            {[
                                { key: 'all', label: t('dashboard.preset_all') },
                                { key: 'this-month', label: t('dashboard.preset_this_month') },
                                { key: 'this-year', label: t('dashboard.preset_this_year') },
                                { key: 'last-30', label: t('dashboard.preset_last_30') },
                                { key: 'last-365', label: t('dashboard.preset_last_365') },
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
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.pending_inquiries')}</p>
                            <span className="material-symbols-outlined text-plutz-tan">mail</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.pending}</p>
                        {!hidePrices && inquiryTotals.pending > 0 && (
                            <div className="mt-2 text-xs text-plutz-tan font-medium flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">trending_up</span>
                                {formatMoney(inquiryTotals.pending)} EUR {t('dashboard.potential')}
                            </div>
                        )}
                    </Link>

                    {/* Confirmed Gigs */}
                    <Link
                        href={route('inquiries.index', { status: 'confirmed', ...dateParams })}
                        className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.confirmed_gigs')}</p>
                            <span className="material-symbols-outlined text-plutz-tan">event_available</span>
                        </div>
                        <p className="text-3xl font-bold text-plutz-cream">{inquiryStats.confirmed}</p>
                        <div className="mt-2 text-xs text-stone-400 font-medium">
                            {nextGig ? `${t('dashboard.next')} ${formatDate(nextGig.performance_date)}` : t('dashboard.no_upcoming')}
                        </div>
                    </Link>

                    {/* Total Income */}
                    {can('income.view') && (
                        <Link
                            href={route('incomes.index', dateParams)}
                            className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.total_income')}</p>
                                <span className="material-symbols-outlined text-plutz-tan">payments</span>
                            </div>
                            <p className="text-3xl font-bold text-plutz-cream">
                                {formatMoney(incomeStats.total)} <span className="text-xl font-normal opacity-70">EUR</span>
                            </p>
                            {incomeStats.total > 0 && (
                                <div className="mt-2 text-xs text-green-500 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    {incomeStats.count} {t('dashboard.incomes_count')}
                                </div>
                            )}
                        </Link>
                    )}

                    {/* Mutual Fund */}
                    {can('income.view') && (
                        <Link href={route('group-costs.index')} className="bg-plutz-surface p-6 rounded-xl border border-plutz-tan/10 shadow-sm hover:border-plutz-tan/30 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-stone-400 text-sm font-medium uppercase tracking-wider">{t('dashboard.mutual_fund')}</p>
                                <span className="material-symbols-outlined text-plutz-tan">account_balance_wallet</span>
                            </div>
                            <p className={`text-3xl font-bold ${mutualFund.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {mutualFund.balance >= 0 ? '+' : ''}{formatMoney(mutualFund.balance)} <span className="text-xl font-normal opacity-70">EUR</span>
                            </p>
                            <div className="mt-3 flex items-center justify-between text-xs">
                                <span className="text-emerald-400 font-medium">{t('group_costs.paid')}: {formatMoney(mutualFund.total_paid)} €</span>
                                <span className="text-amber-400 font-medium">{t('group_costs.unpaid')}: {formatMoney(mutualFund.total_unpaid)} €</span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Main Grid: Upcoming Gigs + Financial Overview */}
                <div className={`grid grid-cols-1 ${can('income.view') ? 'lg:grid-cols-3' : ''} gap-8 mb-12`}>
                    {/* Upcoming Gigs Column */}
                    <div className={can('income.view') ? 'lg:col-span-2' : ''}>
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-2xl font-serif text-plutz-cream">{t('dashboard.upcoming_gigs')}</h2>
                            <Link
                                href={route('inquiries.index', dateParams)}
                                className="text-plutz-tan hover:underline text-sm font-medium uppercase tracking-wider"
                            >
                                {t('dashboard.view_all')}
                            </Link>
                        </div>
                        <div className="bg-plutz-surface rounded-xl border border-plutz-tan/10 overflow-hidden shadow-sm">
                            {upcomingGigs.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-stone-900/50 border-b border-plutz-tan/10">
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">{t('common.date')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">{t('dashboard.venue')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500">{t('common.status')}</th>
                                            <th className="px-6 py-4 text-xs font-semibold uppercase tracking-widest text-stone-500 text-right">{t('dashboard.action')}</th>
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
                                                            {t('dashboard.confirmed')}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                                                            {t('dashboard.pending')}
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
                                    <p className="text-stone-500 text-sm">{t('dashboard.no_upcoming_gigs')}</p>
                                    <Link href={route('inquiries.create')} className="mt-3 inline-block text-plutz-tan hover:text-plutz-tan-light text-sm font-medium transition-colors">
                                        {t('dashboard.add_inquiry')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Financial Overview Column — 1/3 */}
                    {can('income.view') && <div className="lg:col-span-1">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="text-2xl font-serif text-plutz-cream">{t('dashboard.financial_overview')}</h2>
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
                                            <p className="text-sm font-medium text-plutz-cream">{t('dashboard.revenue')}</p>
                                            <p className="text-xs text-stone-400">{incomeStats.count} {t('dashboard.incomes_count')}</p>
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
                                            <p className="text-sm font-medium text-plutz-cream">{t('dashboard.expenses_label')}</p>
                                            <p className="text-xs text-stone-400">{expenseStats.count} {t('dashboard.expense_count')}</p>
                                        </div>
                                    </div>
                                    <p className="font-bold text-plutz-cream">-{formatMoney(expenseStats.total)} EUR</p>
                                </div>

                                {/* Expense Categories */}
                                {(groupCostStats.count > 0 || expenseStats.count > 0) && (
                                    <div className="pt-6 border-t border-plutz-tan/5">
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-4">{t('dashboard.expense_categories')}</p>
                                        <div className="space-y-4">
                                            {groupCostStats.paid > 0 && (
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-stone-500">{t('dashboard.group_costs')}</span>
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
                                                        <span className="text-stone-500">{t('dashboard.direct_expenses')}</span>
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
                                                        <span className="text-stone-500">{t('dashboard.unpaid')}</span>
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
                                        <p className="text-xs text-stone-400 uppercase tracking-widest mb-3">{t('dashboard.invoicing')}</p>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-500">{t('dashboard.with_invoice')}</span>
                                                <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.with_invoice)} EUR</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-stone-500">{t('dashboard.without_invoice')}</span>
                                                <span className="text-plutz-cream font-medium">{formatMoney(incomeStats.without_invoice)} EUR</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>}
                </div>

                {/* Member Breakdown (BandBoss only) */}
                {memberBreakdown && memberBreakdown.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-serif text-plutz-cream mb-4 px-1">{t('dashboard.member_breakdown')}</h2>
                        <div className="overflow-x-auto rounded-xl bg-plutz-surface border border-plutz-tan/10 shadow-sm">
                            <table className="min-w-full divide-y divide-plutz-tan/10">
                                <thead className="bg-stone-900/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">{t('dashboard.member')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('dashboard.distributed')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('dashboard.invoiced')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('dashboard.expenses_label')}</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('dashboard.net')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-plutz-tan/10">
                                    {memberBreakdown.map((member) => {
                                        const net = member.total_distributed - member.total_expenses;
                                        return (
                                            <tr key={member.id} className="hover:bg-stone-900/30">
                                                <td className="px-4 py-3 text-sm font-medium text-plutz-cream">{member.name}</td>
                                                <td className="px-4 py-3 text-sm text-right text-green-400 font-semibold">{formatMoney(member.total_distributed)} €</td>
                                                <td className="px-4 py-3 text-sm text-right text-plutz-tan font-semibold">{formatMoney(member.invoiced_distributed)} €</td>
                                                <td className="px-4 py-3 text-sm text-right text-red-400 font-semibold">{formatMoney(member.total_expenses)} €</td>
                                                <td className="px-4 py-3 text-sm text-right font-bold">
                                                    <span className={net >= 0 ? 'text-emerald-400' : 'text-red-400'}>{net >= 0 ? '+' : ''}{formatMoney(net)} €</span>
                                                    <span className="text-stone-500 font-normal"> ({formatMoney(member.invoiced_distributed - member.total_expenses)} €)</span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* User Personal Stats */}
                {userStats && (
                    <div className="mb-12 bg-plutz-surface rounded-xl border border-plutz-tan/10 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-plutz-tan mb-3 uppercase tracking-wider">{t('dashboard.your_earnings')}</h3>
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
                <div className="bg-plutz-surface/95 sm:bg-plutz-surface/80 backdrop-blur-xl border-t sm:border border-plutz-tan/20 px-2 pt-2 pb-6 sm:p-3 sm:rounded-2xl shadow-2xl flex items-center justify-center gap-2 sm:gap-4">
                    {can('inquiries.create') && (
                        <Link
                            href={route('inquiries.create')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-plutz-tan hover:bg-plutz-tan/90 transition-all text-plutz-dark px-3 sm:px-6 py-3.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest"
                        >
                            <span className="material-symbols-outlined text-base sm:text-lg">add_circle</span>
                            {t('dashboard.new_inquiry')}
                        </Link>
                    )}
                    {can('expenses.create') && (
                        <Link
                            href={route('expenses.create')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-3 sm:px-6 py-3.5 sm:py-3 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest border border-plutz-tan/20"
                        >
                            <span className="material-symbols-outlined text-base sm:text-lg">receipt_long</span>
                            {t('dashboard.add_expense')}
                        </Link>
                    )}
                    {can('income.create') && (
                        <Link
                            href={route('incomes.create')}
                            className="hidden sm:flex items-center gap-2 bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest border border-plutz-tan/20"
                        >
                            <span className="material-symbols-outlined text-lg">account_balance</span>
                            {t('dashboard.add_income')}
                        </Link>
                    )}
                    <Link
                        href={route('calendar.index')}
                        className="sm:hidden flex-shrink-0 flex items-center justify-center bg-plutz-tan/20 hover:bg-plutz-tan/30 transition-all text-plutz-tan p-3.5 rounded-lg border border-plutz-tan/20"
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
