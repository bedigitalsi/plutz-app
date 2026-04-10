import { marked } from 'marked';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState, useEffect, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface Template {
    id: number;
    name: string;
    markdown: string;
    is_active?: boolean;
}

interface Props extends PageProps {
    templates: Template[];
    activeTemplate?: Template;
}

export default function Create({ auth, templates, activeTemplate }: Props) {
    const { t } = useTranslation();
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(
        activeTemplate?.id || null
    );
    const initialMarkdown = useRef(activeTemplate?.markdown || '');
    
    const { data, setData, post, processing, errors } = useForm({
        client_name: '',
        client_email: '',
        client_phone: '',
        client_company: '',
        client_address: '',
        performance_date: '',
        location_name: '',
        location_address: '',
        total_price: '',
        deposit_amount: '',
        currency: 'EUR',
        markdown_snapshot: activeTemplate?.markdown || '',
        contract_template_id: activeTemplate?.id || null,
    });

    const [showPreview, setShowPreview] = useState(false);

    const handleTemplateChange = (templateId: string) => {
        const newTemplateId = templateId ? parseInt(templateId) : null;
        const newTemplate = templates.find(t => t.id === newTemplateId);
        
        if (!newTemplate) {
            setSelectedTemplateId(null);
            return;
        }

        // Check if user has edited the markdown
        const isMarkdownUntouched = 
            data.markdown_snapshot === '' || 
            data.markdown_snapshot === initialMarkdown.current;

        if (isMarkdownUntouched) {
            // Auto-replace if untouched
            setData({
                ...data,
                markdown_snapshot: newTemplate.markdown,
                contract_template_id: newTemplate.id,
            });
            initialMarkdown.current = newTemplate.markdown;
            setSelectedTemplateId(newTemplateId);
        } else {
            // Ask for confirmation if edited
            if (confirm('You have made changes to the contract content. Do you want to replace it with the selected template?')) {
                setData({
                    ...data,
                    markdown_snapshot: newTemplate.markdown,
                    contract_template_id: newTemplate.id,
                });
                initialMarkdown.current = newTemplate.markdown;
                setSelectedTemplateId(newTemplateId);
            }
        }
    };

    // Replace placeholders with actual form data for preview
    const getPreviewHtml = () => {
        let content = data.markdown_snapshot || '';
        content = content.replace(/\[NAROČNIK\]/g, data.client_name || '[NAROČNIK]');
        content = content.replace(/\[EMAIL\]/g, data.client_email || '[EMAIL]');
        content = content.replace(/\[TELEFON\]/g, data.client_phone || '[TELEFON]');
        content = content.replace(/\[PODJETJE\]/g, data.client_company || '[PODJETJE]');
        content = content.replace(/\[NASLOV\]/g, data.client_address || '[NASLOV]');
        content = content.replace(/\[DATUM_NASTOPA\]/g, data.performance_date ? new Date(data.performance_date + 'T00:00:00').toLocaleDateString('sl-SI') : '[DATUM_NASTOPA]');
        content = content.replace(/\[LOKACIJA\]/g, data.location_name || '[LOKACIJA]');
        content = content.replace(/\[NASLOV_LOKACIJE\]/g, data.location_address || '[NASLOV_LOKACIJE]');
        content = content.replace(/\[SKUPNI_ZNESEK\]/g, data.total_price ? `${data.total_price}` : '[SKUPNI_ZNESEK]');
        content = content.replace(/\[AVANS\]/g, data.deposit_amount ? `${data.deposit_amount}` : '[AVANS]');
        content = content.replace(/\[DATUM_POGODBE\]/g, new Date().toLocaleDateString('sl-SI'));
        content = content.replace(/\[ŠT_POGODBE\]/g, 'PLUTZ-' + new Date().getFullYear() + '-XXX');
        content = content.replace(/\[DATUM_PODPISA\]/g, '[ob podpisu]');
        return content;
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('contracts.store'));
    };

    return (
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title={t('contracts.create_contract')} />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">{t('contracts.create_contract')}</h2>
                    <Link href={route('contracts.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">{t('contracts.back')}</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Client Information */}
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.client_information')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.client_name_field')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.client_name && (
                                            <div className="text-red-400 text-sm mt-1">{errors.client_name}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.client_email_field')}
                                        </label>
                                        <input
                                            type="email"
                                            value={data.client_email}
                                            onChange={(e) => setData('client_email', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.client_email && (
                                            <div className="text-red-400 text-sm mt-1">{errors.client_email}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.client_phone')}
                                        </label>
                                        <input
                                            type="tel"
                                            value={data.client_phone}
                                            onChange={(e) => setData('client_phone', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            placeholder="+386..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.company_optional')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_company}
                                            onChange={(e) => setData('client_company', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.performance_date_field')}
                                        </label>
                                        <input
                                            type="date"
                                            value={data.performance_date}
                                            onChange={(e) => setData('performance_date', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.performance_date && (
                                            <div className="text-red-400 text-sm mt-1">{errors.performance_date}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-stone-400 mb-2">
                                        {t('contracts.address_optional')}
                                    </label>
                                    <textarea
                                        value={data.client_address}
                                        onChange={(e) => setData('client_address', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.location')}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.location_name')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location_name}
                                            onChange={(e) => setData('location_name', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            placeholder="npr. Hotel Slon, Grad Otočec..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.location_address')}
                                        </label>
                                        <input
                                            type="text"
                                            value={data.location_address}
                                            onChange={(e) => setData('location_address', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            placeholder="Ulica, mesto..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div>
                                <h3 className="text-lg font-medium text-plutz-cream mb-4">{t('contracts.financial_details')}</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.total_price_field')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.total_price}
                                            onChange={(e) => setData('total_price', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                            required
                                        />
                                        {errors.total_price && (
                                            <div className="text-red-400 text-sm mt-1">{errors.total_price}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.deposit_amount')}
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.deposit_amount}
                                            onChange={(e) => setData('deposit_amount', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.currency')}
                                        </label>
                                        <select
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        >
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Contract Content */}
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-plutz-cream">{t('contracts.contract_content')}</h3>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('contract-templates.index')}
                                            className="text-sm text-stone-400 hover:text-plutz-cream"
                                        >
                                            {t('contracts.manage_templates')}
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="text-sm text-plutz-tan hover:text-plutz-tan"
                                        >
                                            {showPreview ? t('contracts.hide_preview') : t('contracts.show_preview')}
                                        </button>
                                    </div>
                                </div>

                                {templates.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-stone-400 mb-2">
                                            {t('contracts.template')}
                                        </label>
                                        <select
                                            value={selectedTemplateId || ''}
                                            onChange={(e) => handleTemplateChange(e.target.value)}
                                            className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                        >
                                            <option value="">{t('contracts.select_template')}</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name} {template.is_active ? '(Active)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="text-sm text-stone-400 mb-2">
                                    {t('contracts.placeholders_hint')} [ŠT_POGODBE], [DATUM_POGODBE], [NAROČNIK], [EMAIL], [TELEFON], [PODJETJE], [NASLOV], [DATUM_NASTOPA], [LOKACIJA], [NASLOV_LOKACIJE], [SKUPNI_ZNESEK], [AVANS], [DATUM_PODPISA]
                                </div>

                                <textarea
                                    value={data.markdown_snapshot}
                                    onChange={(e) => setData('markdown_snapshot', e.target.value)}
                                    rows={15}
                                    className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan font-mono text-sm"
                                    required
                                />
                                {errors.markdown_snapshot && (
                                    <div className="text-red-400 text-sm mt-1">{errors.markdown_snapshot}</div>
                                )}

                                {showPreview && (
                                    <div className="mt-4 border border-plutz-tan/20 rounded-md overflow-hidden">
                                        <div className="bg-plutz-tan/20 border-b border-plutz-tan/10 px-8 py-3 flex justify-between items-center">
                                            <h4 className="font-medium text-plutz-cream text-sm">{t('contracts.preview')}</h4>
                                            <span className="text-xs text-stone-400">PDF Preview</span>
                                        </div>
                                        {/* PDF-like page */}
                                        <div className="bg-stone-600 p-8 flex justify-center">
                                            <div className="bg-white w-full max-w-[210mm] shadow-2xl" style={{ minHeight: '297mm', padding: '40px 50px' }}>
                                                {/* Contract header */}
                                                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-stone-200">
                                                    <div>
                                                        <img src="/build/assets/plutz-logo-dark.png" alt="Plutz" className="h-10 mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display='none' }} />
                                                        <div style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 'bold', color: '#1a1a1a' }}>
                                                            POGODBA
                                                        </div>
                                                    </div>
                                                    <div className="text-right" style={{ fontFamily: 'Arial, sans-serif', fontSize: '13px', color: '#666' }}>
                                                        <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                                                            Št. pogodbe: PLUTZ-{new Date().getFullYear()}-XXX
                                                        </div>
                                                        <div className="mt-1">
                                                            Datum: {new Date().toLocaleDateString('sl-SI')}
                                                        </div>
                                                        {data.performance_date && (
                                                            <div>
                                                                Datum nastopa: {new Date(data.performance_date + 'T00:00:00').toLocaleDateString('sl-SI')}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Contract body */}
                                                <div 
                                                    className="contract-content"
                                                    style={{
                                                        fontFamily: 'Georgia, serif',
                                                        fontSize: '14px',
                                                        lineHeight: '1.8',
                                                        color: '#1a1a1a'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: marked(getPreviewHtml()) as string }}
                                                />
                                                {/* Footer */}
                                                <div className="mt-12 pt-6 border-t border-stone-200 flex justify-between" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#999' }}>
                                                    <span>Plutz d.o.o.</span>
                                                    <span>Stran 1/1</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('contracts.index')}
                                    className="px-4 py-2 bg-plutz-tan/20 text-stone-400 rounded-md hover:bg-plutz-tan/30"
                                >
                                    {t('common.cancel')}
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                                >
                                    {processing ? t('contracts.creating') : t('contracts.create_contract')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
        </AuthenticatedLayout>
    );
}
