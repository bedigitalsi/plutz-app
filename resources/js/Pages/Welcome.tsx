import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { PageProps } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

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
            <div className="flex min-h-screen flex-col items-center justify-center bg-plutz-dark selection:bg-plutz-teal selection:text-white">
                <Head title="Welcome" />
                <div className="mb-8">
                     <img 
                        src="/images/logo-plutz-25.svg" 
                        alt="Plutz Logo" 
                        className="h-24 w-auto" 
                    />
                </div>
                <div className="w-full max-w-md space-y-8 rounded-xl bg-plutz-cream px-8 py-8 shadow-warm-lg sm:rounded-xl">
                    <div className="text-center">
                        <h2 className="font-serif text-2xl font-bold tracking-tight text-plutz-brown">
                            Welcome back, {auth.user.name}!
                        </h2>
                        <p className="mt-2 text-sm text-plutz-warm-gray">
                            You are already logged in.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Link
                            href={route('dashboard')}
                            className="rounded-xl bg-plutz-teal px-6 py-2.5 text-sm font-semibold text-white shadow-warm hover:bg-plutz-teal-dark focus:outline-none focus:ring-2 focus:ring-plutz-teal focus:ring-offset-2 transition duration-150"
                        >
                            Go to Dashboard
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
            <Head title="Welcome" />

            {status && (
                <div className="mb-4 text-sm font-medium text-emerald-600">
                    {status}
                </div>
            )}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full rounded-lg border-plutz-cream-dark bg-white focus:border-plutz-teal focus:ring-plutz-teal"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full rounded-lg border-plutz-cream-dark bg-white focus:border-plutz-teal focus:ring-plutz-teal"
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
                        <span className="ms-2 text-sm text-plutz-brown">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-6 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-plutz-warm-gray underline hover:text-plutz-brown focus:outline-none focus:ring-2 focus:ring-plutz-teal focus:ring-offset-2 transition duration-150"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
            <div className="mt-8 text-center text-xs text-plutz-warm-gray/60">
                Laravel v{laravelVersion} (PHP v{phpVersion})
            </div>
        </GuestLayout>
    );
}
