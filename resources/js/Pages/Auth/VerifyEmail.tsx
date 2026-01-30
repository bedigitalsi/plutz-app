import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/hooks/useTranslation';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { t } = useTranslation();
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title={t('auth.verify_email.resend')} />

            <div className="mb-4 text-sm text-stone-400">
                {t('auth.verify_email.description')}
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-sm font-medium text-green-400">
                    {t('auth.verify_email.sent')}
                </div>
            )}

            <form onSubmit={submit}>
                <div className="mt-4 flex items-center justify-between">
                    <PrimaryButton disabled={processing}>
                        {t('auth.verify_email.resend')}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="rounded-md text-sm text-stone-400 underline hover:text-plutz-cream focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2"
                    >
                        {t('nav.logout')}
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
