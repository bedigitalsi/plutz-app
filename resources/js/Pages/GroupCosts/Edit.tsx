import React, { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import MoneyInput from '@/Components/MoneyInput';
import { useTranslation } from '@/hooks/useTranslation';

interface CostType {
    id: number;
    name: string;
}

interface GroupCost {
    id: number;
    cost_date: string;
    cost_type_id: number;
    amount: string;
    currency: string;
    is_paid: boolean;
    notes: string;
    cost_type: {
        id: number;
        name: string;
    };
    creator: {
        id: number;
        name: string;
    };
}

interface Props {
    groupCost: GroupCost;
    costTypes: CostType[];
}

export default function Edit({ groupCost, costTypes }: Props) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        cost_date: groupCost.cost_date,
        cost_type_id: groupCost.cost_type_id.toString(),
        amount: groupCost.amount,
        currency: groupCost.currency || 'EUR',
        is_paid: groupCost.is_paid,
        notes: groupCost.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('group-costs.update', groupCost.id));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('group_costs.edit_group_cost')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('group_costs.edit_group_cost')}</h2>
                    <Link href={route('group-costs.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('group_costs.back_to_list')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('group_costs.cost_details')}</h3>
                                <p className="mt-1 text-sm text-stone-400">
                                    {t('group_costs.update_expenses')}
                                </p>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="cost_date" value={t('group_costs.cost_date')} />
                                        <TextInput
                                            id="cost_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.cost_date}
                                            onChange={(e) => setData('cost_date', e.target.value)}
                                        />
                                        <InputError message={errors.cost_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="cost_type_id" value={t('group_costs.cost_type_field')} />
                                        <select
                                            id="cost_type_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.cost_type_id}
                                            onChange={(e) => setData('cost_type_id', e.target.value)}
                                            required
                                        >
                                            <option value="">{t('group_costs.select_type')}</option>
                                            {costTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.cost_type_id} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <MoneyInput
                                        label={t('common.amount')}
                                        value={data.amount}
                                        onChange={(value) => setData('amount', value)}
                                        currency={data.currency}
                                        error={errors.amount}
                                        required
                                    />
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_paid}
                                            onChange={(e) => setData('is_paid', e.target.checked)}
                                            className="rounded border-plutz-tan/20 text-plutz-tan shadow-sm focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">{t('group_costs.mark_as_paid')}</span>
                                    </label>
                                    <p className="mt-1 text-xs text-stone-500">
                                        {t('group_costs.paid_hint')}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value={t('common.notes')} />
                                <textarea
                                    id="notes"
                                    className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    rows={4}
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                />
                                <InputError message={errors.notes} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('group-costs.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('group_costs.update_group_cost')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
