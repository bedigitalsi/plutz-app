import React, { FormEventHandler, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/hooks/useTranslation';

interface PerformanceType {
    id: number;
    name: string;
}

interface BandSize {
    id: number;
    label: string;
}

interface Inquiry {
    id: number;
    performance_date: string;
    performance_time_mode: 'exact_time' | 'text_time';
    performance_time_exact?: string;
    performance_time_text?: string;
    duration_minutes: number;
    location_name: string;
    location_address?: string;
    contact_person: string;
    contact_email?: string;
    contact_phone?: string;
    performance_type_id: number;
    band_size_id: number;
    price_amount?: number;
    currency: string;
    notes?: string;
}

interface Props {
    inquiry: Inquiry;
    performanceTypes: PerformanceType[];
    bandSizes: BandSize[];
}

export default function Edit({ inquiry, performanceTypes, bandSizes }: Props) {
    const { t } = useTranslation();
    const hidePrices = (usePage().props.auth as any).user?.hide_prices;
    const [timeMode, setTimeMode] = useState<'exact_time' | 'text_time'>(inquiry.performance_time_mode);

    const { data, setData, patch, processing, errors } = useForm({
        performance_date: inquiry.performance_date,
        performance_time_mode: inquiry.performance_time_mode,
        performance_time_exact: inquiry.performance_time_exact || '',
        performance_time_text: inquiry.performance_time_text || '',
        duration_minutes: inquiry.duration_minutes.toString(),
        location_name: inquiry.location_name,
        location_address: inquiry.location_address || '',
        contact_person: inquiry.contact_person,
        contact_email: inquiry.contact_email || '',
        contact_phone: inquiry.contact_phone || '',
        performance_type_id: inquiry.performance_type_id.toString(),
        band_size_id: inquiry.band_size_id.toString(),
        price_amount: inquiry.price_amount?.toString() || '',
        currency: inquiry.currency,
        notes: inquiry.notes || '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('inquiries.update', inquiry.id));
    };

    const handleTimeModeChange = (mode: 'exact_time' | 'text_time') => {
        setTimeMode(mode);
        setData('performance_time_mode', mode);
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('inquiries.edit_inquiry')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('inquiries.edit_inquiry')}</h2>
                    <Link href={route('inquiries.show', inquiry.id)} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('inquiries.back_to_details')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Performance Details */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('inquiries.performance_details')}</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="performance_date" value={t('inquiries.performance_date')} />
                                        <TextInput
                                            id="performance_date"
                                            type="date"
                                            className="mt-1 block w-full"
                                            value={data.performance_date}
                                            onChange={(e) => setData('performance_date', e.target.value)}
                                            required
                                        />
                                        <InputError message={errors.performance_date} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="performance_type_id" value={t('inquiries.performance_type')} />
                                        <select
                                            id="performance_type_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.performance_type_id}
                                            onChange={(e) => setData('performance_type_id', e.target.value)}
                                            required
                                        >
                                            {performanceTypes.map((type) => (
                                                <option key={type.id} value={type.id}>
                                                    {type.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.performance_type_id} className="mt-2" />
                                    </div>
                                </div>

                                {/* Time Mode */}
                                <div className="mt-4">
                                    <InputLabel value={t('inquiries.performance_time')} />
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={timeMode === 'exact_time'}
                                                onChange={() => handleTimeModeChange('exact_time')}
                                                className="h-4 w-4 border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                            />
                                            <span className="ml-2 text-sm text-stone-400">{t('inquiries.exact_time')}</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={timeMode === 'text_time'}
                                                onChange={() => handleTimeModeChange('text_time')}
                                                className="h-4 w-4 border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                            />
                                            <span className="ml-2 text-sm text-stone-400">{t('inquiries.text_description')}</span>
                                        </label>
                                    </div>

                                    {timeMode === 'exact_time' ? (
                                        <TextInput
                                            type="time"
                                            className="mt-2 block w-full md:w-1/2"
                                            value={data.performance_time_exact}
                                            onChange={(e) => setData('performance_time_exact', e.target.value)}
                                        />
                                    ) : (
                                        <TextInput
                                            type="text"
                                            placeholder={t('inquiries.time_placeholder')}
                                            className="mt-2 block w-full md:w-1/2"
                                            value={data.performance_time_text}
                                            onChange={(e) => setData('performance_time_text', e.target.value)}
                                        />
                                    )}
                                    <InputError message={errors.performance_time_exact || errors.performance_time_text} className="mt-2" />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="duration_minutes" value={t('inquiries.duration_minutes')} />
                                        <TextInput
                                            id="duration_minutes"
                                            type="number"
                                            className="mt-1 block w-full"
                                            value={data.duration_minutes}
                                            onChange={(e) => setData('duration_minutes', e.target.value)}
                                        />
                                        <InputError message={errors.duration_minutes} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="band_size_id" value={t('inquiries.band_size_select')} />
                                        <select
                                            id="band_size_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.band_size_id}
                                            onChange={(e) => setData('band_size_id', e.target.value)}
                                            required
                                        >
                                            {bandSizes.map((size) => (
                                                <option key={size.id} value={size.id}>
                                                    {size.label}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.band_size_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('inquiries.location')}</h3>
                                
                                <div className="mt-4">
                                    <InputLabel htmlFor="location_name" value={t('inquiries.location_name')} />
                                    <TextInput
                                        id="location_name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.location_name}
                                        onChange={(e) => setData('location_name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.location_name} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="location_address" value={t('inquiries.address')} />
                                    <TextInput
                                        id="location_address"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.location_address}
                                        onChange={(e) => setData('location_address', e.target.value)}
                                    />
                                    <InputError message={errors.location_address} className="mt-2" />
                                </div>
                            </div>

                            {/* Contact */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('inquiries.contact_information')}</h3>
                                
                                <div className="mt-4">
                                    <InputLabel htmlFor="contact_person" value={t('inquiries.contact_person_field')} />
                                    <TextInput
                                        id="contact_person"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.contact_person}
                                        onChange={(e) => setData('contact_person', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.contact_person} className="mt-2" />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="contact_email" value={t('inquiries.email')} />
                                        <TextInput
                                            id="contact_email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            value={data.contact_email}
                                            onChange={(e) => setData('contact_email', e.target.value)}
                                        />
                                        <InputError message={errors.contact_email} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="contact_phone" value={t('inquiries.phone_field')} />
                                        <TextInput
                                            id="contact_phone"
                                            type="tel"
                                            className="mt-1 block w-full"
                                            value={data.contact_phone}
                                            onChange={(e) => setData('contact_phone', e.target.value)}
                                        />
                                        <InputError message={errors.contact_phone} className="mt-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Price */}
                            {!hidePrices && (
                                <div className="border-b border-plutz-tan/10 pb-6">
                                    <h3 className="text-lg font-medium text-plutz-cream">{t('inquiries.price')}</h3>

                                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <InputLabel htmlFor="price_amount" value={t('common.amount')} />
                                            <TextInput
                                                id="price_amount"
                                                type="number"
                                                step="0.01"
                                                className="mt-1 block w-full"
                                                value={data.price_amount}
                                                onChange={(e) => setData('price_amount', e.target.value)}
                                            />
                                            <InputError message={errors.price_amount} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="currency" value={t('inquiries.currency')} />
                                            <TextInput
                                                id="currency"
                                                type="text"
                                                className="mt-1 block w-full"
                                                value={data.currency}
                                                onChange={(e) => setData('currency', e.target.value)}
                                            />
                                            <InputError message={errors.currency} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Notes */}
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

                            {/* Submit */}
                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('inquiries.show', inquiry.id)}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('inquiries.update_inquiry')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
