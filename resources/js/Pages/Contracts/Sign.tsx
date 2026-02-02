import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useMemo } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { marked } from 'marked';
import { useTranslation } from '@/hooks/useTranslation';

interface Contract {
    id: number;
    client_name: string;
    client_email: string;
    client_company: string | null;
    client_address: string | null;
    performance_date: string;
    total_price: string;
    currency: string;
}

interface Props {
    contract: Contract;
    markdown: string;
    token: string;
}

export default function Sign({ contract, markdown, token }: Props) {
    const { t } = useTranslation();
    const signaturePad = useRef<SignatureCanvas>(null);
    const [signatureError, setSignatureError] = useState('');
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Prefill form with contract values
    const { data, setData, errors } = useForm({
        signer_name: contract.client_name || '',
        signer_email: contract.client_email || '',
        signer_company: contract.client_company || '',
        signer_address: contract.client_address || '',
        signature_data: '',
        consented: false,
    });

    // Generate preview content with live substitution and markdown parsing
    const previewHtml = useMemo(() => {
        let content = markdown || '';
        // Substitute signer form values into the markdown for live preview
        content = content.replace(new RegExp(contract.client_name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), data.signer_name || contract.client_name);
        content = content.replace(new RegExp(contract.client_email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), data.signer_email || contract.client_email);
        if (contract.client_company) {
            content = content.replace(new RegExp(contract.client_company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), data.signer_company || contract.client_company);
        }
        if (contract.client_address) {
            content = content.replace(new RegExp(contract.client_address.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), data.signer_address || contract.client_address);
        }
        return marked(content);
    }, [markdown, data.signer_name, data.signer_email, data.signer_company, data.signer_address, contract]);

    const clearSignature = () => {
        signaturePad.current?.clear();
        setSignatureError('');
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (signaturePad.current?.isEmpty()) {
            setSignatureError(t('signing.signature_error'));
            return;
        }

        const signatureData = signaturePad.current?.toDataURL();
        
        setProcessing(true);
        
        // Use router.post directly to avoid async setData race condition
        router.post(route('contracts.sign.submit', token), {
            signer_name: data.signer_name,
            signer_email: data.signer_email,
            signer_company: data.signer_company,
            signer_address: data.signer_address,
            signature_data: signatureData || '',
            consented: data.consented,
        }, {
            onSuccess: () => {
                setSuccess(true);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    if (success) {
        return (
            <div className="min-h-screen bg-plutz-dark flex items-center justify-center p-4">
                <Head title={t('signing.success_title')} />
                <div className="max-w-md w-full bg-plutz-surface shadow-lg rounded-lg p-8 text-center">
                    <div className="mb-4">
                        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-plutz-cream mb-2">{t('signing.success_title')}</h1>
                    <p className="text-stone-400 mb-6">
                        {t('signing.success_message')}
                    </p>
                    <p className="text-sm text-stone-500">
                        {t('signing.close_window')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-plutz-dark py-12 px-4 sm:px-6 lg:px-8">
            <Head title={t('signing.title')} />
            
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-plutz-surface shadow-sm rounded-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-plutz-cream mb-2">{t('signing.header')}</h1>
                    <p className="text-stone-400">
                        {t('signing.description')}
                    </p>
                </div>

                {/* Contract Preview - PDF Style */}
                <div className="bg-plutz-surface shadow-lg rounded-lg overflow-hidden mb-6">
                    {/* PDF-like header bar */}
                    <div className="bg-plutz-tan/20 border-b border-plutz-tan/10 px-8 py-4">
                        <h2 className="text-xl font-bold text-plutz-cream">{t('signing.document')}</h2>
                    </div>
                    
                    {/* PDF-like content area with margins */}
                    <div className="px-12 py-10 bg-white" style={{ minHeight: '800px' }}>
                        {/* Contract content with PDF-like styling */}
                        <div 
                            className="contract-content"
                            style={{
                                fontFamily: 'Georgia, serif',
                                fontSize: '15px',
                                lineHeight: '1.8',
                                color: '#1a1a1a'
                            }}
                            dangerouslySetInnerHTML={{ __html: previewHtml as string }}
                        />
                    </div>
                </div>

                {/* Signing Form */}
                <div className="bg-plutz-surface shadow-sm rounded-lg p-8">
                    <h2 className="text-xl font-semibold text-plutz-cream mb-6">{t('signing.your_information')}</h2>
                    
                    <form onSubmit={submit} className="space-y-6">
                        {/* Signer Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('signing.full_name')}
                                </label>
                                <input
                                    type="text"
                                    value={data.signer_name}
                                    onChange={(e) => setData('signer_name', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    required
                                />
                                {errors.signer_name && (
                                    <div className="text-red-400 text-sm mt-1">{errors.signer_name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('signing.email')}
                                </label>
                                <input
                                    type="email"
                                    value={data.signer_email}
                                    onChange={(e) => setData('signer_email', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    required
                                />
                                {errors.signer_email && (
                                    <div className="text-red-400 text-sm mt-1">{errors.signer_email}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-400 mb-2">
                                    {t('signing.company')}
                                </label>
                                <input
                                    type="text"
                                    value={data.signer_company}
                                    onChange={(e) => setData('signer_company', e.target.value)}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                {t('signing.address')}
                            </label>
                            <textarea
                                value={data.signer_address}
                                onChange={(e) => setData('signer_address', e.target.value)}
                                rows={3}
                                className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                            />
                        </div>

                        {/* Signature Pad */}
                        <div>
                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                {t('signing.signature')}
                            </label>
                            <div className="border-2 border-plutz-tan/20 rounded-md bg-white">
                                <SignatureCanvas
                                    ref={signaturePad}
                                    canvasProps={{
                                        className: 'w-full h-48 cursor-crosshair',
                                    }}
                                    backgroundColor="rgb(255, 255, 255)"
                                    onEnd={() => setSignatureError('')}
                                />
                            </div>
                            {signatureError && (
                                <div className="text-red-400 text-sm mt-1">{signatureError}</div>
                            )}
                            {errors.signature_data && (
                                <div className="text-red-400 text-sm mt-1">{errors.signature_data}</div>
                            )}
                            <button
                                type="button"
                                onClick={clearSignature}
                                className="mt-2 text-sm text-stone-400 hover:text-plutz-cream"
                            >
                                {t('signing.clear')}
                            </button>
                        </div>

                        {/* Consent */}
                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                checked={data.consented}
                                onChange={(e) => setData('consented', e.target.checked)}
                                className="mt-1 h-4 w-4 text-plutz-tan focus:ring-plutz-tan border-plutz-tan/20 rounded"
                                required
                            />
                            <label className="ml-2 block text-sm text-stone-400">
                                {t('signing.consent')}
                            </label>
                        </div>
                        {errors.consented && (
                            <div className="text-red-400 text-sm">{errors.consented}</div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-plutz-tan hover:bg-plutz-tan/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-plutz-tan disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {processing ? t('signing.submitting') : t('signing.submit')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-stone-500">
                    <p>
                        {t('signing.footer')}
                    </p>
                </div>
            </div>
        </div>
    );
}
