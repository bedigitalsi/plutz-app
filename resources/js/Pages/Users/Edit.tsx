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

interface User {
    id: number;
    name: string;
    email: string;
    is_band_member: boolean;
    roles: Role[];
}

interface Props {
    user: User;
    roles: Role[];
}

export default function Edit({ user, roles }: Props) {
    const { t } = useTranslation();
    const { data, setData, patch, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        is_band_member: user.is_band_member,
        role: user.roles.length > 0 ? user.roles[0].name : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={`${t('users.edit_user')} - ${user.name}`} />

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
                                    <InputLabel htmlFor="password" value={t('users.password_edit')} />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                    />
                                    <p className="mt-1 text-xs text-stone-500">
                                        {t('users.password_edit_help')}
                                    </p>
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="password_confirmation" value={t('users.password_confirm_edit')} />
                                    <TextInput
                                        id="password_confirmation"
                                        type="password"
                                        className="mt-1 block w-full"
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
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
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <Link
                                    href={route('users.index')}
                                    className="text-sm text-stone-400 hover:text-plutz-cream"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <PrimaryButton disabled={processing}>
                                    {t('users.update_user')}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
