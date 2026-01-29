import React, { FormEventHandler, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface PerformanceType {
    id: number;
    name: string;
}

interface BandSize {
    id: number;
    label: string;
}

interface Props {
    performanceTypes: PerformanceType[];
    bandSizes: BandSize[];
    date?: string;
}

export default function Create({ performanceTypes, bandSizes, date }: Props) {
    const [timeMode, setTimeMode] = useState<'exact_time' | 'text_time'>('exact_time');

    const { data, setData, post, processing, errors } = useForm({
        performance_date: date || '',
        performance_time_mode: 'exact_time',
        performance_time_exact: '',
        performance_time_text: '',
        duration_minutes: '120',
        location_name: '',
        location_address: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        performance_type_id: '',
        band_size_id: '',
        price_amount: '',
        currency: 'EUR',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('inquiries.store'));
    };

    const handleTimeModeChange = (mode: 'exact_time' | 'text_time') => {
        setTimeMode(mode);
        setData('performance_time_mode', mode);
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="New Inquiry" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">New Inquiry</h2>
                    <Link href={route('inquiries.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">Back to List</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            {/* Performance Details */}
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">Performance Details</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="performance_date" value="Performance Date *" />
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
                                        <InputLabel htmlFor="performance_type_id" value="Performance Type *" />
                                        <select
                                            id="performance_type_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.performance_type_id}
                                            onChange={(e) => setData('performance_type_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select type...</option>
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
                                    <InputLabel value="Performance Time *" />
                                    <div className="mt-2 flex gap-4">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={timeMode === 'exact_time'}
                                                onChange={() => handleTimeModeChange('exact_time')}
                                                className="h-4 w-4 border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                            />
                                            <span className="ml-2 text-sm text-stone-400">Exact time</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                checked={timeMode === 'text_time'}
                                                onChange={() => handleTimeModeChange('text_time')}
                                                className="h-4 w-4 border-plutz-tan/20 text-plutz-tan focus:ring-plutz-tan"
                                            />
                                            <span className="ml-2 text-sm text-stone-400">Text description</span>
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
                                            placeholder="e.g. afternoon, TBD"
                                            className="mt-2 block w-full md:w-1/2"
                                            value={data.performance_time_text}
                                            onChange={(e) => setData('performance_time_text', e.target.value)}
                                        />
                                    )}
                                    <InputError message={errors.performance_time_exact || errors.performance_time_text} className="mt-2" />
                                </div>

                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="duration_minutes" value="Duration (minutes)" />
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
                                        <InputLabel htmlFor="band_size_id" value="Band Size *" />
                                        <select
                                            id="band_size_id"
                                            className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            value={data.band_size_id}
                                            onChange={(e) => setData('band_size_id', e.target.value)}
                                            required
                                        >
                                            <option value="">Select size...</option>
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
                                <h3 className="text-lg font-medium text-plutz-cream">Location</h3>
                                
                                <div className="mt-4">
                                    <InputLabel htmlFor="location_name" value="Location Name *" />
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
                                    <InputLabel htmlFor="location_address" value="Address" />
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
                                <h3 className="text-lg font-medium text-plutz-cream">Contact Information</h3>
                                
                                <div className="mt-4">
                                    <InputLabel htmlFor="contact_person" value="Contact Person *" />
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
                                        <InputLabel htmlFor="contact_email" value="Email" />
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
                                        <InputLabel htmlFor="contact_phone" value="Phone" />
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
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">Price</h3>
                                
                                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <InputLabel htmlFor="price_amount" value="Amount" />
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
                                        <InputLabel htmlFor="currency" value="Currency" />
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

                            {/* Notes */}
                            <div>
                                <InputLabel htmlFor="notes" value="Notes" />
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
                                    href={route('inquiries.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    Cancel
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    Create Inquiry
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
