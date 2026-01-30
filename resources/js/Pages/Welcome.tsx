import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Welcome({
    auth,
    laravelVersion,
    phpVersion,
    status,
    canResetPassword,
}: PageProps<{
    laravelVersion: string;
    phpVersion: string;
    status?: string;
    canResetPassword: boolean;
}>) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    if (auth.user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-plutz-dark selection:bg-plutz-tan selection:text-white">
                <Head title={t('welcome.title')} />
                <div className="mb-8">
                     <img
                        src="/images/logo-plutz-25.svg"
                        alt="Plutz Logo"
                        className="h-24 w-auto"
                    />
                </div>
                <div className="w-full max-w-md space-y-8 rounded-xl bg-plutz-dark px-8 py-8 shadow-sm-lg sm:rounded-xl">
                    <div className="text-center">
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-plutz-cream">
                            {t('welcome.already_logged')}
                        </h2>
                        <p className="mt-2 text-sm text-plutz-warm-gray">
                            {t('welcome.logged_in')}
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl bg-plutz-tan px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-plutz-tan-dark focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 transition duration-150"
                        >
                            {t('welcome.go_dashboard')}
                        </Link>
                    </div>
                </div>
                <footer className="py-16 text-center text-sm text-plutz-cream/40">
                    Laravel v{laravelVersion} (PHP v{phpVersion})
                </footer>
            </div>
        );
    }

    return (
        <GuestLayout>
            <Head title={t('welcome.title')} />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value={t('auth.login.email')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-plutz-tan/10 bg-plutz-surface focus:border-plutz-tan focus:ring-plutz-tan"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t('auth.login.password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-plutz-tan/10 bg-plutz-surface focus:border-plutz-tan focus:ring-plutz-tan"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4 block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData(
                                    'remember',
                                    (e.target.checked || false) as false,
                                )
                            }
                        />
                        <span className="ms-2 text-sm text-plutz-cream">
                            {t('auth.login.remember')}
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-plutz-warm-gray underline hover:text-plutz-cream focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 transition duration-150"
                        >
                            {t('auth.login.forgot')}
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        {t('auth.login')}
                    </PrimaryButton>
                </div>
            </form>
            <div className="mt-8 text-center text-xs text-plutz-warm-gray/60">
                Laravel v{laravelVersion} (PHP v{phpVersion})
            </div>
        </GuestLayout>
    );
}
