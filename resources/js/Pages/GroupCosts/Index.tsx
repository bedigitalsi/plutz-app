import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

interface GroupCost {
    id: number;
    cost_date: string;
    amount: number;
    paid_amount: number;
    currency: string;
    is_paid: boolean;
    notes?: string;
    cost_type: {
        name: string;
    } | null;
    creator: {
        name: string;
    } | null;
}

interface CostType {
    id: number;
    name: string;
}

interface FundStats {
    opening_balance: number;
    total_inflows: number;
    total_pool: number;
    total_costs: number;
    total_paid: number;
    total_unpaid: number;
    balance: number;
    surplus: number;
    deficit: number;
}

interface Props {
    groupCosts: {
        data: GroupCost[];
    };
    costTypes: CostType[];
    filters: any;
    fundStats: FundStats;
}

export default function Index({ groupCosts, costTypes, filters, fundStats }: Props) {
    const { t } = useTranslation();
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [costTypeId, setCostTypeId] = useState(filters.cost_type_id || '');
    const [isPaid, setIsPaid] = useState(filters.is_paid || '');

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (costTypeId) params.cost_type_id = costTypeId;
        if (isPaid) params.is_paid = isPaid;
        router.get(route('group-costs.index'), params, { preserveState: true });
    };

    const clearFilters = () => {
        setDateFrom('');
        setDateTo('');
        setCostTypeId('');
        setIsPaid('');
        router.get(route('group-costs.index'), {}, { preserveState: true });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sl-SI', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    };

    const handleDelete = (costId: number) => {
        if (confirm(t('group_costs.confirm_delete'))) {
            router.delete(route('group-costs.destroy', costId));
        }
    };

    const paidPct = (cost: GroupCost) => {
        if (parseFloat(cost.amount.toString()) === 0) return 100;
        return Math.min(100, (parseFloat(cost.paid_amount.toString()) / parseFloat(cost.amount.toString())) * 100);
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('group_costs.title')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('group_costs.title')}</h2>
                    <Link href={route('group-costs.create')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('group_costs.new_cost')}</Link>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto w-full p-6">
                {/* Fund Summary */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-[#2d2a28]">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{t('group_costs.fund_balance')}</p>
                        <p className={`text-2xl font-bold mt-1 ${fundStats.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {fundStats.balance >= 0 ? '+' : ''}{formatAmount(fundStats.balance)} EUR
                        </p>
                    </div>
                    <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-[#2d2a28]">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{t('group_costs.total_costs')}</p>
                        <p className="text-2xl font-bold text-plutz-cream mt-1">{formatAmount(fundStats.total_costs)} EUR</p>
                    </div>
                    <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-[#2d2a28]">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{t('group_costs.total_paid')}</p>
                        <p className="text-2xl font-bold text-emerald-400 mt-1">{formatAmount(fundStats.total_paid)} EUR</p>
                    </div>
                    <div className="rounded-lg bg-plutz-surface p-4 shadow-sm border border-[#2d2a28]">
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{t('group_costs.total_unpaid')}</p>
                        <p className="text-2xl font-bold text-amber-400 mt-1">{formatAmount(fundStats.total_unpaid)} EUR</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg bg-plutz-surface p-4 shadow-sm border border-[#2d2a28]">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        <div>
                            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">{t('group_costs.from_date')}</label>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">{t('group_costs.to_date')}</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">{t('group_costs.cost_type')}</label>
                            <select value={costTypeId} onChange={(e) => setCostTypeId(e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm">
                                <option value="">{t('group_costs.all')}</option>
                                {costTypes.map((type) => (
                                    <option key={type.id} value={type.id}>{type.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">{t('group_costs.status')}</label>
                            <select value={isPaid} onChange={(e) => setIsPaid(e.target.value)}
                                className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm">
                                <option value="">{t('group_costs.all')}</option>
                                <option value="yes">{t('group_costs.paid')}</option>
                                <option value="no">{t('group_costs.unpaid')}</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button onClick={handleFilter}
                                className="flex-1 rounded-md bg-plutz-tan px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan/90">
                                {t('group_costs.apply_filters')}
                            </button>
                            {(dateFrom || dateTo || costTypeId || isPaid) && (
                                <button onClick={clearFilters}
                                    className="rounded-md border border-stone-600 px-3 py-2 text-sm text-stone-400 hover:text-white hover:border-stone-400 transition-colors">
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Costs List */}
                {groupCosts.data.length === 0 ? (
                    <div className="rounded-lg bg-plutz-surface p-8 text-center shadow-sm">
                        <p className="text-stone-500">{t('group_costs.no_costs')}</p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg bg-plutz-surface shadow-sm border border-[#2d2a28]">
                        <table className="min-w-full divide-y divide-plutz-tan/10">
                            <thead className="bg-stone-900/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">{t('group_costs.date')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">{t('group_costs.type')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500">{t('common.notes')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('group_costs.amount')}</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500 min-w-[160px]">{t('group_costs.status')}</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-stone-500">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-plutz-tan/10 bg-plutz-surface">
                                {groupCosts.data.map((cost) => {
                                    const pct = paidPct(cost);
                                    const paid = parseFloat(cost.paid_amount?.toString() || '0');
                                    const total = parseFloat(cost.amount.toString());
                                    const remaining = total - paid;

                                    return (
                                        <tr key={cost.id} className="hover:bg-stone-900/30">
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-plutz-cream">
                                                {formatDate(cost.cost_date)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-plutz-cream">
                                                {cost.cost_type?.name || '—'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-stone-500 max-w-[200px] truncate">
                                                {cost.notes || '—'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-plutz-cream text-right">
                                                {formatAmount(total)} {cost.currency}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {cost.is_paid ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                                        {t('group_costs.paid')}
                                                    </span>
                                                ) : paid > 0 ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between text-xs">
                                                            <span className="text-amber-400 font-semibold">{formatAmount(paid)} / {formatAmount(total)}</span>
                                                        </div>
                                                        <div className="w-full bg-stone-700 rounded-full h-1.5">
                                                            <div className="bg-amber-400 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-400">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                        {t('group_costs.unpaid')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link href={route('group-costs.edit', cost.id)} className="text-plutz-tan hover:text-plutz-cream text-xs">
                                                        {t('common.edit')}
                                                    </Link>
                                                    <button onClick={() => handleDelete(cost.id)} className="text-red-400 hover:text-red-300 text-xs">
                                                        {t('common.delete')}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
