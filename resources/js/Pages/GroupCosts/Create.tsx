import React, { FormEventHandler, useState, useRef, useEffect } from 'react';
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

interface Props {
    costTypes: CostType[];
}

export default function Create({ costTypes }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        cost_date: new Date().toISOString().split('T')[0],
        cost_type_id: '' as string,
        new_cost_type: '',
        amount: '',
        currency: 'EUR',
        is_paid: false,
        notes: '',
    });

    const [typeSearch, setTypeSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredTypes = costTypes.filter(t =>
        t.name.toLowerCase().includes(typeSearch.toLowerCase())
    );
    const exactMatch = costTypes.find(t => t.name.toLowerCase() === typeSearch.toLowerCase());

    const selectType = (type: CostType) => {
        setData(prev => ({ ...prev, cost_type_id: String(type.id), new_cost_type: '' }));
        setTypeSearch(type.name);
        setShowDropdown(false);
    };

    const handleTypeInput = (value: string) => {
        setTypeSearch(value);
        setShowDropdown(true);
        if (!exactMatch) {
            setData(prev => ({ ...prev, cost_type_id: '', new_cost_type: value }));
        }
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('group-costs.store'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('group_costs.new_group_cost')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('group_costs.new_group_cost')}</h2>
                    <Link href={route('group-costs.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('group_costs.back_to_list')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('group_costs.cost_details')}</h3>
                                <p className="mt-1 text-sm text-stone-400">
                                    {t('group_costs.track_expenses')}
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

                                    <div ref={dropdownRef} className="relative">
                                        <InputLabel htmlFor="cost_type" value={t('group_costs.cost_type_field')} />
                                        <input
                                            id="cost_type"
                                            type="text"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={typeSearch}
                                            onChange={(e) => handleTypeInput(e.target.value)}
                                            onFocus={() => setShowDropdown(true)}
                                            placeholder={t('group_costs.select_type')}
                                            autoComplete="off"
                                        />
                                        {showDropdown && (filteredTypes.length > 0 || (typeSearch && !exactMatch)) && (
                                            <div className="absolute z-50 mt-1 w-full rounded-md bg-plutz-surface border border-[#2d2a28] shadow-xl max-h-48 overflow-y-auto">
                                                {filteredTypes.map((type) => (
                                                    <button
                                                        key={type.id}
                                                        type="button"
                                                        onClick={() => selectType(type)}
                                                        className="w-full text-left px-3 py-2 text-sm text-plutz-cream hover:bg-stone-700/50 transition-colors"
                                                    >
                                                        {type.name}
                                                    </button>
                                                ))}
                                                {typeSearch && !exactMatch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setData(prev => ({ ...prev, cost_type_id: '', new_cost_type: typeSearch }));
                                                            setShowDropdown(false);
                                                        }}
                                                        className="w-full text-left px-3 py-2 text-sm text-emerald-400 hover:bg-stone-700/50 transition-colors border-t border-[#2d2a28]"
                                                    >
                                                        + "{typeSearch}"
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        <InputError message={errors.cost_type_id || errors.new_cost_type} className="mt-2" />
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

                                {/* Paid status handled automatically by FIFO */}
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
                                    {t('group_costs.create_group_cost')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
