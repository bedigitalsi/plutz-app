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
        client_company: '',
        client_address: '',
        performance_date: '',
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
    const getPreviewContent = () => {
        let content = data.markdown_snapshot || '';
        content = content.replace(/\[NAROČNIK\]/g, data.client_name || '[NAROČNIK]');
        content = content.replace(/\[EMAIL\]/g, data.client_email || '[EMAIL]');
        content = content.replace(/\[PODJETJE\]/g, data.client_company || '[PODJETJE]');
        content = content.replace(/\[NASLOV\]/g, data.client_address || '[NASLOV]');
        content = content.replace(/\[DATUM_NASTOPA\]/g, data.performance_date || '[DATUM_NASTOPA]');
        content = content.replace(/\[SKUPNI_ZNESEK\]/g, data.total_price ? `${data.total_price} ${data.currency}` : '[SKUPNI_ZNESEK]');
        content = content.replace(/\[AVANS\]/g, data.deposit_amount ? `${data.deposit_amount} ${data.currency}` : '[AVANS]');
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
                                    {t('contracts.placeholders_hint')} [NAROČNIK], [EMAIL], [PODJETJE], [NASLOV], [DATUM_NASTOPA], [SKUPNI_ZNESEK], [AVANS], [PLUTZ_ADDRESS]
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
                                    <div className="mt-4 p-4 border border-plutz-tan/20 rounded-md bg-stone-900/50">
                                        <h4 className="font-medium mb-2">{t('contracts.preview')}</h4>
                                        <div className="prose max-w-none">
                                            {getPreviewContent().split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
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
