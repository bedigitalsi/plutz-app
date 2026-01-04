import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { FormEventHandler } from 'react';

export default function Create({ auth }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        markdown: '',
        is_active: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('contract-templates.store'));
    };

    const placeholders = [
        { code: '[NAROČNIK]', description: 'Client name' },
        { code: '[EMAIL]', description: 'Client email' },
        { code: '[PODJETJE]', description: 'Client company' },
        { code: '[NASLOV]', description: 'Client address' },
        { code: '[DATUM_NASTOPA]', description: 'Performance date' },
        { code: '[SKUPNI_ZNESEK]', description: 'Total price' },
        { code: '[AVANS]', description: 'Deposit amount' },
        { code: '[PLUTZ_ADDRESS]', description: 'Plutz address' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Create Contract Template</h2>
                    <Link
                        href={route('contract-templates.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Templates
                    </Link>
                </div>
            }
        >
            <Head title="Create Contract Template" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Template Name *
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    required
                                />
                                {errors.name && (
                                    <div className="text-red-600 text-sm mt-1">{errors.name}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contract Content (Markdown) *
                                </label>
                                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-sm font-medium text-blue-900 mb-2">Available Placeholders:</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-blue-800">
                                        {placeholders.map((placeholder) => (
                                            <div key={placeholder.code}>
                                                <code className="bg-blue-100 px-1 py-0.5 rounded">{placeholder.code}</code>
                                                <span className="ml-2">{placeholder.description}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={data.markdown}
                                    onChange={(e) => setData('markdown', e.target.value)}
                                    rows={20}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                                    required
                                />
                                {errors.markdown && (
                                    <div className="text-red-600 text-sm mt-1">{errors.markdown}</div>
                                )}
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 block text-sm text-gray-700">
                                    Set as active template (will be used by default when creating contracts)
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <Link
                                    href={route('contract-templates.index')}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create Template'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
