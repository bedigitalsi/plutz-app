import React, { useState } from 'react';
import InputLabel from './InputLabel';
import InputError from './InputError';
import MoneyInput from './MoneyInput';
import PrimaryButton from './PrimaryButton';
import { useTranslation } from '@/hooks/useTranslation';

interface BandMember {
    id: number;
    name: string;
    is_band_member: boolean;
}

interface Distribution {
    recipient_type: 'user' | 'mutual_fund';
    recipient_user_id?: number;
    amount: string;
    note: string;
}

interface DistributionFormProps {
    bandMembers: BandMember[];
    totalAmount: number;
    existingDistributions?: any[];
    onSubmit: (distributions: Distribution[]) => void;
    processing?: boolean;
    errors?: any;
}

export default function DistributionForm({
    bandMembers,
    totalAmount,
    existingDistributions = [],
    onSubmit,
    processing = false,
    errors = {},
}: DistributionFormProps) {
    const { t } = useTranslation();

    const initializeDistributions = () => {
        if (existingDistributions.length > 0) {
            return existingDistributions.map(d => ({
                recipient_type: d.recipient_type,
                recipient_user_id: d.recipient_user_id,
                amount: d.amount.toString(),
                note: d.note || '',
            }));
        }

        const dists: Distribution[] = bandMembers.map(member => ({
            recipient_type: 'user' as const,
            recipient_user_id: member.id,
            amount: '',
            note: '',
        }));

        dists.push({
            recipient_type: 'mutual_fund',
            recipient_user_id: undefined,
            amount: '',
            note: '',
        });

        return dists;
    };

    const [distributions, setDistributions] = useState<Distribution[]>(initializeDistributions());
    const [includeMutualFund, setIncludeMutualFund] = useState(false);

    const updateDistribution = (index: number, field: keyof Distribution, value: any) => {
        const newDistributions = [...distributions];
        newDistributions[index] = { ...newDistributions[index], [field]: value };
        setDistributions(newDistributions);
    };

    const getTotalDistributed = () => {
        return distributions.reduce((sum, d) => sum + (parseFloat(d.amount) || 0), 0);
    };

    const getRemaining = () => {
        return totalAmount - getTotalDistributed();
    };

    const distributeEqually = () => {
        const newDistributions = [...distributions];

        const distributionsToUpdate = includeMutualFund
            ? newDistributions
            : newDistributions.filter(d => d.recipient_type !== 'mutual_fund');

        const amount = (totalAmount / distributionsToUpdate.length).toFixed(2);

        newDistributions.forEach(dist => {
            if (includeMutualFund || dist.recipient_type !== 'mutual_fund') {
                dist.amount = amount;
            } else {
                dist.amount = '0';
            }
        });

        setDistributions(newDistributions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validDistributions = distributions.filter(d => parseFloat(d.amount) > 0);
        onSubmit(validDistributions);
    };

    const remaining = getRemaining();
    const isOverDistributed = remaining < 0;

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-medium text-plutz-cream">{t('distribution.title')}</h3>
                        <p className="mt-1 text-sm text-stone-400">
                            {t('distribution.total_to_distribute')} <span className="font-semibold text-plutz-cream">{totalAmount.toFixed(2)} EUR</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={includeMutualFund}
                                onChange={(e) => setIncludeMutualFund(e.target.checked)}
                                className="h-4 w-4 rounded border-plutz-tan/20 bg-plutz-dark text-plutz-tan focus:ring-plutz-tan"
                            />
                            <span className="text-stone-400">{t('distribution.include_mutual_fund')}</span>
                        </label>
                        <button
                            type="button"
                            onClick={distributeEqually}
                            className="rounded-xl bg-plutz-tan/20 px-3 py-2 text-sm font-semibold text-plutz-tan hover:bg-plutz-tan/30 border border-plutz-tan/20 transition"
                        >
                            {t('distribution.distribute_equally')}
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {distributions.map((dist, index) => {
                        const recipient = dist.recipient_type === 'user'
                            ? bandMembers.find(m => m.id === dist.recipient_user_id)
                            : null;

                        const name = dist.recipient_type === 'mutual_fund'
                            ? t('distribution.mutual_fund')
                            : recipient?.name || 'Unknown';

                        return (
                            <div key={index} className="rounded-xl border border-plutz-tan/10 bg-plutz-dark p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value={t('distribution.recipient')} />
                                        <div className="mt-1 flex items-center">
                                            <span className="font-medium text-plutz-cream">{name}</span>
                                            {dist.recipient_type === 'mutual_fund' && (
                                                <span className="ml-2 rounded-full bg-plutz-tan/20 px-2 py-0.5 text-xs text-plutz-tan">
                                                    {t('distribution.band_fund')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <MoneyInput
                                        label={t('distribution.amount')}
                                        value={dist.amount}
                                        onChange={(value) => updateDistribution(index, 'amount', value)}
                                        error={errors[`distributions.${index}.amount`]}
                                    />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor={`note-${index}`} value={t('distribution.note_optional')} />
                                    <input
                                        id={`note-${index}`}
                                        type="text"
                                        value={dist.note}
                                        onChange={(e) => updateDistribution(index, 'note', e.target.value)}
                                        className="mt-1 block w-full rounded-lg border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan sm:text-sm"
                                        placeholder={t('distribution.note_placeholder')}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-xl bg-stone-900/50 border border-plutz-tan/10 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-stone-400">{t('distribution.total_distributed')}</span>
                        <span className="font-semibold text-plutz-cream">
                            {getTotalDistributed().toFixed(2)} EUR
                        </span>
                    </div>
                    <div className={`mt-2 flex items-center justify-between text-sm ${isOverDistributed ? 'text-red-400' : 'text-stone-400'}`}>
                        <span>{t('distribution.remaining')}</span>
                        <span className="font-semibold">
                            {remaining.toFixed(2)} EUR
                        </span>
                    </div>
                    {isOverDistributed && (
                        <p className="mt-2 text-sm text-red-400">
                            {t('distribution.over_distributed')}
                        </p>
                    )}
                </div>

                {errors.distributions && (
                    <InputError message={errors.distributions} className="mt-2" />
                )}
            </div>

            <div className="flex items-center justify-end">
                <PrimaryButton disabled={processing || isOverDistributed}>
                    {processing ? t('distribution.saving') : t('distribution.save')}
                </PrimaryButton>
            </div>
        </form>
    );
}
