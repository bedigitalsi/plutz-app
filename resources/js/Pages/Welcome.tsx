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
            <div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 selection:bg-[#FF2D20] selection:text-white">
                <Head title="Welcome" />
                <div className="mb-8">
                     <img 
                        src="/images/logo-plutz-25.svg" 
                        alt="Plutz Logo" 
                        className="h-24 w-auto" 
                    />
                </div>
                <div className="w-full max-w-md space-y-8 bg-white px-4 py-8 shadow-md sm:rounded-lg dark:bg-gray-800">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Welcome back, {auth.user.name}!
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            You are already logged in.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center">
                        <Link
                            href={route('dashboard')}
                            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-white"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
                <footer className="py-16 text-center text-sm text-white/70">
                    Laravel v{laravelVersion} (PHP v{phpVersion})
                </footer>
            </div>
        );
    }

    return (
        <GuestLayout>
            <Head title="Welcome" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
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
                        className="mt-1 block w-full"
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
                        className="mt-1 block w-full"
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
                        <span className="ms-2 text-sm text-gray-600">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="mt-4 flex items-center justify-end">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            Forgot your password?
                        </Link>
                    )}

                    <PrimaryButton className="ms-4" disabled={processing}>
                        Log in
                    </PrimaryButton>
                </div>
            </form>
            <div className="mt-8 text-center text-xs text-gray-500">
                Laravel v{laravelVersion} (PHP v{phpVersion})
            </div>
        </GuestLayout>
    );
}
