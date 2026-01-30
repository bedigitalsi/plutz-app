import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';

export default function Install() {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t('help.install_title')} />

            <div className="min-h-screen bg-plutz-dark py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-plutz-surface shadow sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-3xl font-bold text-plutz-cream mb-6">
                                {t('help.install_title')}
                            </h1>

                            <div className="prose prose-blue max-w-none">
                                <h2 className="text-xl font-semibold text-plutz-cream mt-6 mb-4">
                                    {t('help.steps_title')}
                                </h2>

                                <ol className="list-decimal list-inside space-y-4 text-stone-400">
                                    <li className="pl-2">
                                        {t('help.step1')}
                                    </li>
                                    <li className="pl-2">
                                        {t('help.step2')}
                                    </li>
                                    <li className="pl-2">
                                        {t('help.step3')}
                                    </li>
                                    <li className="pl-2">
                                        {t('help.step4')}
                                    </li>
                                    <li className="pl-2">
                                        {t('help.step5')}
                                    </li>
                                </ol>

                                <div className="mt-8 bg-plutz-tan/10 border-l-4 border-plutz-tan/30 p-4">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg
                                                className="h-5 w-5 text-blue-400"
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-plutz-tan">
                                                {t('help.tip')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-xl font-semibold text-plutz-cream mt-8 mb-4">
                                    {t('help.benefits_title')}
                                </h2>

                                <ul className="list-disc list-inside space-y-2 text-stone-400">
                                    <li className="pl-2">{t('help.benefit1')}</li>
                                    <li className="pl-2">{t('help.benefit2')}</li>
                                    <li className="pl-2">{t('help.benefit3')}</li>
                                    <li className="pl-2">{t('help.benefit4')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

