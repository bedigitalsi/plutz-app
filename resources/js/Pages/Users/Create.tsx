import React, { FormEventHandler } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { useTranslation } from '@/hooks/useTranslation';

interface Role {
    id: number;
    name: string;
}

interface Props {
    roles: Role[];
}

export default function Create({ roles }: Props) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        is_band_member: false,
        hide_prices: false,
        role: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('users.add_user')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('users.add_new_user')}</h2>
                    <Link href={route('users.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('users.back_to_list')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="overflow-hidden bg-plutz-surface shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="space-y-6 p-6">
                            <div className="border-b border-plutz-tan/10 pb-6">
                                <h3 className="text-lg font-medium text-plutz-cream">{t('users.user_details')}</h3>

                                <div className="mt-4">
                                    <InputLabel htmlFor="name" value={t('users.name_field')} />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        className="mt-1 block w-full"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="email" value={t('users.email_field')} />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="password" value={t('users.password_field')} />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="password_confirmation" value={t('users.password_confirm')} />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.password_confirmation} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="role" value={t('users.role_field')} />
                                    <select
                                        id="role"
                                        className="mt-1 block w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        required
                                    >
                                        <option value="">{t('users.select_role')}</option>
                                        {roles.map((role) => (
                                            <option key={role.id} value={role.name}>
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.role} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_band_member}
                                            onChange={(e) => setData('is_band_member', e.target.checked)}
                                            className="rounded border-plutz-tan/20 text-plutz-tan shadow-sm focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">{t('users.is_band_member')}</span>
                                    </label>
                                    <p className="mt-1 text-xs text-stone-500">
                                        {t('users.band_member_help')}
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.hide_prices}
                                            onChange={(e) => setData('hide_prices', e.target.checked)}
                                            className="rounded border-plutz-tan/20 text-plutz-tan shadow-sm focus:ring-plutz-tan"
                                        />
                                        <span className="ml-2 text-sm text-stone-400">{t('users.hide_prices')}</span>
                                    </label>
                                    <p className="mt-1 text-xs text-stone-500">
                                        {t('users.hide_prices_help')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('users.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('users.create_user')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
