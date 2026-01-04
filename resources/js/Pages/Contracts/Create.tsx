import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler, useState, useEffect, useRef } from 'react';

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
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Contract</h2>
                    <Link
                        href={route('contracts.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Contracts
                    </Link>
                </div>
            }
        >
            <Head title="Create Contract" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            {/* Client Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Client Information</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_name}
                                            onChange={(e) => setData('client_name', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.client_name && (
                                            <div className="text-red-600 text-sm mt-1">{errors.client_name}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Client Email *
                                        </label>
                                        <input
                                            type="email"
                                            value={data.client_email}
                                            onChange={(e) => setData('client_email', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.client_email && (
                                            <div className="text-red-600 text-sm mt-1">{errors.client_email}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.client_company}
                                            onChange={(e) => setData('client_company', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Performance Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={data.performance_date}
                                            onChange={(e) => setData('performance_date', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.performance_date && (
                                            <div className="text-red-600 text-sm mt-1">{errors.performance_date}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Address (Optional)
                                    </label>
                                    <textarea
                                        value={data.client_address}
                                        onChange={(e) => setData('client_address', e.target.value)}
                                        rows={3}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Financial Information */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Total Price *
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.total_price}
                                            onChange={(e) => setData('total_price', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                        {errors.total_price && (
                                            <div className="text-red-600 text-sm mt-1">{errors.total_price}</div>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Deposit Amount
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={data.deposit_amount}
                                            onChange={(e) => setData('deposit_amount', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Currency
                                        </label>
                                        <select
                                            value={data.currency}
                                            onChange={(e) => setData('currency', e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                                    <h3 className="text-lg font-medium text-gray-900">Contract Content</h3>
                                    <div className="flex space-x-3">
                                        <Link
                                            href={route('contract-templates.index')}
                                            className="text-sm text-gray-600 hover:text-gray-900"
                                        >
                                            Manage Templates
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setShowPreview(!showPreview)}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {showPreview ? 'Hide Preview' : 'Show Preview'}
                                        </button>
                                    </div>
                                </div>

                                {templates.length > 0 && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Template
                                        </label>
                                        <select
                                            value={selectedTemplateId || ''}
                                            onChange={(e) => handleTemplateChange(e.target.value)}
                                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        >
                                            <option value="">Select a template...</option>
                                            {templates.map((template) => (
                                                <option key={template.id} value={template.id}>
                                                    {template.name} {template.is_active ? '(Active)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="text-sm text-gray-600 mb-2">
                                    You can use these placeholders: [NAROČNIK], [EMAIL], [PODJETJE], [NASLOV], [DATUM_NASTOPA], [SKUPNI_ZNESEK], [AVANS], [PLUTZ_ADDRESS]
                                </div>

                                <textarea
                                    value={data.markdown_snapshot}
                                    onChange={(e) => setData('markdown_snapshot', e.target.value)}
                                    rows={15}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                                    required
                                />
                                {errors.markdown_snapshot && (
                                    <div className="text-red-600 text-sm mt-1">{errors.markdown_snapshot}</div>
                                )}

                                {showPreview && (
                                    <div className="mt-4 p-4 border border-gray-300 rounded-md bg-gray-50">
                                        <h4 className="font-medium mb-2">Preview:</h4>
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
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Contract'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
