import React, { useState } from 'react';
import InputLabel from './InputLabel';
import InputError from './InputError';
import MoneyInput from './MoneyInput';
import PrimaryButton from './PrimaryButton';

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
    const initializeDistributions = () => {
        if (existingDistributions.length > 0) {
            return existingDistributions.map(d => ({
                recipient_type: d.recipient_type,
                recipient_user_id: d.recipient_user_id,
                amount: d.amount.toString(),
                note: d.note || '',
            }));
        }
        
        // Default: add all band members + mutual fund
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
        
        // Filter distributions based on includeMutualFund setting
        const distributionsToUpdate = includeMutualFund 
            ? newDistributions 
            : newDistributions.filter(d => d.recipient_type !== 'mutual_fund');
        
        const amount = (totalAmount / distributionsToUpdate.length).toFixed(2);
        
        // Update distributions
        newDistributions.forEach(dist => {
            if (includeMutualFund || dist.recipient_type !== 'mutual_fund') {
                dist.amount = amount;
            } else {
                // Set mutual fund to 0 if not included
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
                        <h3 className="text-lg font-medium text-gray-900">Income Distribution</h3>
                        <p className="mt-1 text-sm text-gray-600">
                            Total to distribute: <span className="font-semibold">{totalAmount.toFixed(2)} EUR</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={includeMutualFund}
                                onChange={(e) => setIncludeMutualFund(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-gray-700">Include Mutual Fund</span>
                        </label>
                        <button
                            type="button"
                            onClick={distributeEqually}
                            className="rounded-md bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300"
                        >
                            Distribute Equally
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {distributions.map((dist, index) => {
                        const recipient = dist.recipient_type === 'user' 
                            ? bandMembers.find(m => m.id === dist.recipient_user_id)
                            : null;
                        
                        const name = dist.recipient_type === 'mutual_fund' 
                            ? 'Mutual Fund' 
                            : recipient?.name || 'Unknown';

                        return (
                            <div key={index} className="rounded-lg border border-gray-200 p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel value="Recipient" />
                                        <div className="mt-1 flex items-center">
                                            <span className="font-medium text-gray-900">{name}</span>
                                            {dist.recipient_type === 'mutual_fund' && (
                                                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800">
                                                    Band Fund
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <MoneyInput
                                        label="Amount"
                                        value={dist.amount}
                                        onChange={(value) => updateDistribution(index, 'amount', value)}
                                        error={errors[`distributions.${index}.amount`]}
                                    />
                                </div>
                                
                                <div className="mt-4">
                                    <InputLabel htmlFor={`note-${index}`} value="Note (optional)" />
                                    <input
                                        id={`note-${index}`}
                                        type="text"
                                        value={dist.note}
                                        onChange={(e) => updateDistribution(index, 'note', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        placeholder="Optional note..."
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total Distributed:</span>
                        <span className="font-semibold text-gray-900">
                            {getTotalDistributed().toFixed(2)} EUR
                        </span>
                    </div>
                    <div className={`mt-2 flex items-center justify-between text-sm ${isOverDistributed ? 'text-red-600' : 'text-gray-600'}`}>
                        <span>Remaining:</span>
                        <span className="font-semibold">
                            {remaining.toFixed(2)} EUR
                        </span>
                    </div>
                    {isOverDistributed && (
                        <p className="mt-2 text-sm text-red-600">
                            ⚠️ Total distributed exceeds income amount!
                        </p>
                    )}
                </div>

                {errors.distributions && (
                    <InputError message={errors.distributions} className="mt-2" />
                )}
            </div>

            <div className="flex items-center justify-end">
                <PrimaryButton disabled={processing || isOverDistributed}>
                    {processing ? 'Saving...' : 'Save Distribution'}
                </PrimaryButton>
            </div>
        </form>
    );
}
