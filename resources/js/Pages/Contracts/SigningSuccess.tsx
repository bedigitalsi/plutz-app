import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

interface Contract {
    id: number;
    client_name: string;
    signer_name: string;
    signer_email: string;
}

interface Props {
    contract: Contract;
    pending?: boolean;
}

export default function SigningSuccess({ contract, pending = false }: Props) {
    const { t } = useTranslation();
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-plutz-dark p-4">
            <Head title={pending ? t('signing.partial_title') : t('signing.success_title')} />
            <img src="/images/logo-plutz-25.svg" alt="Plutz" className="mb-6 h-12 w-auto sm:h-14" />
            <div className="w-full max-w-md rounded-2xl bg-plutz-surface p-6 text-center shadow-2xl ring-1 ring-plutz-tan/10 sm:p-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                    <svg className="h-9 w-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="mb-3 font-serif text-2xl font-bold text-plutz-cream sm:text-3xl">
                    {pending ? t('signing.partial_title') : t('signing.success_title')}
                </h1>

                {pending ? (
                    <p className="mb-6 text-stone-400">{t('signing.partial_message')}</p>
                ) : (
                    <>
                        <p className="mb-5 text-stone-400">{t('signing.thanks')}</p>

                        <div className="mb-6 rounded-lg bg-plutz-dark/60 px-4 py-3 ring-1 ring-plutz-tan/15">
                            <p className="text-xs uppercase tracking-[0.14em] text-plutz-tan">{t('signing.signed_by')}</p>
                            <p className="mt-1 font-medium text-plutz-cream">{contract.signer_name}</p>
                            <p className="break-all text-sm text-stone-400">{contract.signer_email}</p>
                        </div>
                    </>
                )}

                <div className="border-t border-plutz-tan/10 pt-5">
                    {!pending && <p className="text-sm text-stone-500">{t('signing.email_info')}</p>}
                    <p className="mt-2 text-sm text-stone-500">{t('signing.close_safely')}</p>
                </div>
            </div>
        </div>
    );
}
