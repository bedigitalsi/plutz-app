import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const { t } = useTranslation();
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            locale: (user as any).locale || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-plutz-cream">
                    {t('profile.info_title')}
                </h2>

                <p className="mt-1 text-sm text-stone-400">
                    {t('profile.info_description')}
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value={t('common.name')} />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value={t('common.email')} />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="locale" value={t('common.language')} />

                    <select
                        id="locale"
                        className="mt-1 block w-full rounded-lg border-stone-700 bg-plutz-dark text-plutz-cream shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                        value={data.locale}
                        onChange={(e) => setData('locale', e.target.value)}
                    >
                        <option value="">{t('common.system_default')}</option>
                        <option value="en">English</option>
                        <option value="sl">Slovenščina</option>
                    </select>

                    <InputError className="mt-2" message={(errors as any).locale} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-plutz-cream">
                            {t('profile.email_unverified')}
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-stone-400 underline hover:text-plutz-cream focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2"
                            >
                                {t('profile.resend_verification')}
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-400">
                                {t('profile.verification_sent')}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>{t('common.save')}</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-stone-400">
                            {t('common.saved')}
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
