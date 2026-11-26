import { Head, useForm, router } from '@inertiajs/react';
import { FormEventHandler, useRef, useState, useMemo } from 'react';
import SignaturePad, { SignaturePadHandle } from '@/Components/SignaturePad';
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
    require_all_signatures?: boolean;
}

interface Props {
    contract: Contract;
    markdown: string;
    token: string;
    recipient?: { name: string | null; email: string | null };
    signers?: { name: string | null; signed: boolean }[];
}

export default function Sign({ contract, markdown, token, recipient, signers = [] }: Props) {
    const requireAll = !!contract.require_all_signatures;
    const { t } = useTranslation();
    const signaturePad = useRef<SignaturePadHandle>(null);
    const signaturePad2 = useRef<SignaturePadHandle>(null);
    const [signatureError, setSignatureError] = useState('');
    const [hasSecondSigner, setHasSecondSigner] = useState(false);
    const [signer2Name, setSigner2Name] = useState('');
    const [signer2Email, setSigner2Email] = useState('');
    const [signature2Error, setSignature2Error] = useState('');
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    // Prefill form with contract values
    const { data, setData, errors } = useForm({
        signer_name: recipient?.name || contract.client_name || '',
        signer_email: recipient?.email || contract.client_email || '',
        signer_company: contract.client_company || '',
        signer_address: contract.client_address || '',
        signature_data: '',
        consented: false,
    });

    const extraErrors = errors as Record<string, string | undefined>;

    // Generate preview content with live placeholder substitution and markdown parsing
    const previewHtml = useMemo(() => {
        let content = markdown || '';
        // Replace signer placeholders with live form values
        content = content.replaceAll('[NAROČNIK]', data.signer_name || '-');
        content = content.replaceAll('[EMAIL]', data.signer_email || '-');
        content = content.replaceAll('[PODJETJE]', data.signer_company || '-');
        content = content.replaceAll('[NASLOV]', data.signer_address || '-');
        return marked(content);
    }, [markdown, data.signer_name, data.signer_email, data.signer_company, data.signer_address]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        
        if (!signaturePad.current || signaturePad.current.isEmpty()) {
            setSignatureError(t('signing.signature_error'));
            signaturePad.current?.scrollIntoView();
            return;
        }

        if (hasSecondSigner && !requireAll) {
            if (!signer2Name.trim()) {
                setSignature2Error(t('signing.second_name_error'));
                return;
            }
            if (!signaturePad2.current || signaturePad2.current.isEmpty()) {
                setSignature2Error(t('signing.second_signature_error'));
                signaturePad2.current?.scrollIntoView();
                return;
            }
        }

        const signatureData = signaturePad.current?.toDataURL();
        const signature2Data = hasSecondSigner && !requireAll ? signaturePad2.current?.toDataURL() : undefined;
        
        setProcessing(true);
        
        // Use router.post directly to avoid async setData race condition
        router.post(route('contracts.sign.submit', token), {
            signer_name: data.signer_name,
            signer_email: data.signer_email,
            signer_company: data.signer_company,
            signer_address: data.signer_address,
            signature_data: signatureData || '',
            consented: data.consented,
            ...(hasSecondSigner && !requireAll ? {
                signer2_name: signer2Name.trim(),
                signer2_email: signer2Email.trim(),
                signature2_data: signature2Data || '',
            } : {}),
        }, {
            onSuccess: () => {
                setSuccess(true);
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const inputClass = 'block w-full rounded-lg border-plutz-tan/30 bg-white px-3.5 py-2.5 text-base text-plutz-dark shadow-sm focus:border-plutz-tan focus:ring-plutz-tan';
    const labelClass = 'mb-1.5 block text-sm font-medium text-stone-300';
    const errorClass = 'mt-1.5 text-sm text-red-400';

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-plutz-dark p-4">
                <Head title={t('signing.success_title')} />
                <div className="w-full max-w-md rounded-2xl bg-plutz-surface p-6 text-center shadow-2xl ring-1 ring-plutz-tan/10 sm:p-8">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                        <svg className="h-9 w-9 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="mb-2 font-serif text-2xl font-bold text-plutz-cream">{t('signing.success_title')}</h1>
                    <p className="mb-6 text-stone-400">{t('signing.success_message')}</p>
                    <p className="text-sm text-stone-500">{t('signing.close_window')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-plutz-dark px-3 pb-6 pt-5 sm:px-6 sm:py-10 lg:px-8">
            <Head title={t('signing.title')} />

            <div className="mx-auto max-w-3xl">
                {/* Header */}
                <header className="mb-5 px-1 text-center sm:mb-8">
                    <img src="/images/logo-plutz-25.svg" alt="Plutz" className="mx-auto mb-3 h-12 w-auto sm:h-16" />
                    <h1 className="font-serif text-2xl font-bold text-plutz-cream sm:text-3xl">{t('signing.header')}</h1>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-stone-400 sm:text-base">{t('signing.description')}</p>
                </header>

                {/* Who signs this contract (separate links) */}
                {requireAll && signers.length > 1 && (
                    <div className="mb-4 rounded-xl bg-plutz-surface p-4 ring-1 ring-plutz-tan/10 sm:mb-6 sm:p-6">
                        <h2 className="text-base font-semibold text-plutz-cream sm:text-lg">{t('signing.signers_title')}</h2>
                        <p className="mb-3 mt-1 text-sm text-stone-400">{t('signing.signers_help')}</p>
                        <ul className="divide-y divide-plutz-tan/10">
                            {signers.map((s, i) => (
                                <li key={i} className="flex items-center justify-between gap-3 py-2 text-sm">
                                    <span className="flex min-w-0 items-center gap-2.5">
                                        <span
                                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                                                s.signed ? 'bg-green-500/15 text-green-400' : 'ring-1 ring-stone-600'
                                            }`}
                                        >
                                            {s.signed ? '✓' : ''}
                                        </span>
                                        <span className="truncate text-plutz-cream">{s.name || '-'}</span>
                                    </span>
                                    <span className={`shrink-0 text-xs ${s.signed ? 'text-green-400' : 'text-stone-500'}`}>
                                        {s.signed ? t('signing.signer_signed') : t('signing.signer_pending')}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Contract preview: a sheet of paper */}
                <div className="mb-4 overflow-hidden rounded-xl bg-white shadow-lg sm:mb-6">
                    <div className="border-b border-stone-200 bg-[#F7F5EF] px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-plutz-tan sm:px-10">
                        {t('signing.document')}
                    </div>
                    <div className="px-4 py-5 sm:px-10 sm:py-9">
                        <div
                            className="contract-content contract-content--sign"
                            dangerouslySetInnerHTML={{ __html: previewHtml as string }}
                        />
                    </div>
                </div>

                {/* Signing form */}
                <div className="rounded-xl bg-plutz-surface p-4 ring-1 ring-plutz-tan/10 sm:p-8">
                    <h2 className="mb-4 font-serif text-xl font-bold text-plutz-cream sm:mb-6">{t('signing.your_information')}</h2>

                    <form onSubmit={submit} className="space-y-5 sm:space-y-6">
                        {/* Signer information: one field per row on phones */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label htmlFor="signer_name" className={labelClass}>{t('signing.full_name')}</label>
                                <input
                                    id="signer_name"
                                    type="text"
                                    autoComplete="name"
                                    value={data.signer_name}
                                    onChange={(e) => setData('signer_name', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {errors.signer_name && <div className={errorClass}>{errors.signer_name}</div>}
                            </div>

                            <div>
                                <label htmlFor="signer_email" className={labelClass}>{t('signing.email')}</label>
                                <input
                                    id="signer_email"
                                    type="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    value={data.signer_email}
                                    onChange={(e) => setData('signer_email', e.target.value)}
                                    className={inputClass}
                                    required
                                />
                                {errors.signer_email && <div className={errorClass}>{errors.signer_email}</div>}
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="signer_company" className={labelClass}>{t('signing.company')}</label>
                                <input
                                    id="signer_company"
                                    type="text"
                                    autoComplete="organization"
                                    value={data.signer_company}
                                    onChange={(e) => setData('signer_company', e.target.value)}
                                    className={inputClass}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="signer_address" className={labelClass}>{t('signing.address')}</label>
                                <textarea
                                    id="signer_address"
                                    autoComplete="street-address"
                                    value={data.signer_address}
                                    onChange={(e) => setData('signer_address', e.target.value)}
                                    rows={2}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        {/* Signature pad */}
                        <div>
                            <div className={labelClass}>{t('signing.signature')}</div>
                            <SignaturePad
                                ref={signaturePad}
                                hint={t('signing.signature_hint')}
                                clearLabel={t('signing.clear')}
                                invalid={!!signatureError}
                                onBegin={() => setSignatureError('')}
                            />
                            {signatureError && <div className={errorClass}>{signatureError}</div>}
                            {errors.signature_data && <div className={errorClass}>{errors.signature_data}</div>}
                        </div>

                        {/* Optional second signer (not offered when every recipient signs via their own link) */}
                        {!requireAll && (
                        <div className="border-t border-plutz-tan/10 pt-5 sm:pt-6">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={hasSecondSigner}
                                    onChange={(e) => { setHasSecondSigner(e.target.checked); setSignature2Error(''); }}
                                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-plutz-tan/40 text-plutz-tan focus:ring-plutz-tan"
                                />
                                <span className="text-sm text-stone-300">{t('signing.add_second_signer')}</span>
                            </label>

                            {hasSecondSigner && (
                                <div className="mt-5 space-y-4">
                                    <h3 className="font-serif text-lg font-bold text-plutz-cream">{t('signing.second_signer')}</h3>
                                    <div>
                                        <label htmlFor="signer2_name" className={labelClass}>{t('signing.second_signer_name')}</label>
                                        <input
                                            id="signer2_name"
                                            type="text"
                                            value={signer2Name}
                                            onChange={(e) => { setSigner2Name(e.target.value); setSignature2Error(''); }}
                                            className={inputClass}
                                            required
                                        />
                                        {extraErrors.signer2_name && <div className={errorClass}>{extraErrors.signer2_name}</div>}
                                    </div>
                                    <div>
                                        <label htmlFor="signer2_email" className={labelClass}>{t('signing.second_signer_email')}</label>
                                        <input
                                            id="signer2_email"
                                            type="email"
                                            inputMode="email"
                                            value={signer2Email}
                                            onChange={(e) => setSigner2Email(e.target.value)}
                                            className={inputClass}
                                        />
                                        {extraErrors.signer2_email && <div className={errorClass}>{extraErrors.signer2_email}</div>}
                                    </div>
                                    <div>
                                        <div className={labelClass}>{t('signing.second_signature')}</div>
                                        <SignaturePad
                                            ref={signaturePad2}
                                            hint={t('signing.signature_hint')}
                                            clearLabel={t('signing.clear')}
                                            invalid={!!signature2Error}
                                            onBegin={() => setSignature2Error('')}
                                        />
                                        {signature2Error && <div className={errorClass}>{signature2Error}</div>}
                                        {extraErrors.signature2_data && <div className={errorClass}>{extraErrors.signature2_data}</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}

                        {/* Consent */}
                        <div className="border-t border-plutz-tan/10 pt-5 sm:pt-6">
                            <label className="flex cursor-pointer items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={data.consented}
                                    onChange={(e) => setData('consented', e.target.checked)}
                                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-plutz-tan/40 text-plutz-tan focus:ring-plutz-tan"
                                    required
                                />
                                <span className="text-sm leading-relaxed text-stone-300">{t('signing.consent')}</span>
                            </label>
                            {errors.consented && <div className={errorClass}>{errors.consented}</div>}
                        </div>

                        {/* Submit: stays in reach at the bottom of the screen on phones */}
                        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 rounded-b-xl border-t border-plutz-tan/10 bg-plutz-surface/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:static sm:m-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex w-full items-center justify-center rounded-lg bg-plutz-tan px-4 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-plutz-tan-light focus:outline-none focus:ring-2 focus:ring-plutz-tan focus:ring-offset-2 focus:ring-offset-plutz-surface disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {processing ? t('signing.submitting') : t('signing.submit')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-5 px-2 text-center text-xs leading-relaxed text-stone-500 sm:text-sm">{t('signing.footer')}</p>
            </div>
        </div>
    );
}
