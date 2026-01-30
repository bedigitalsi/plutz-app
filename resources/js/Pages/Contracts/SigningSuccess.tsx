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
}

export default function SigningSuccess({ contract }: Props) {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-plutz-dark flex items-center justify-center p-4">
            <Head title={t('signing.success_title')} />
            <div className="max-w-md w-full bg-plutz-surface shadow-2xl rounded-2xl p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center">
                        <svg className="h-12 w-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                
                <h1 className="text-3xl font-bold text-plutz-cream mb-3">
                    {t('signing.success_title')}
                </h1>
                
                <div className="mb-6 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-stone-400">
                        <strong>{t('signing.signed_by')}</strong> {contract.signer_name}
                    </p>
                    <p className="text-stone-400 text-sm mt-1">
                        {contract.signer_email}
                    </p>
                </div>

                <p className="text-stone-400 mb-6">
                    {t('signing.thanks')}
                </p>

                <div className="border-t border-plutz-tan/10 pt-6">
                    <p className="text-sm text-stone-500">
                        {t('signing.email_info')}
                    </p>
                    <p className="text-sm text-stone-500 mt-2">
                        {t('signing.close_safely')}
                    </p>
                </div>
            </div>
        </div>
    );
}
