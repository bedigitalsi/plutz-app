import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface Props {
    settings: {
        plutz_address: string;
    };
}

export default function Contracts({ settings }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        plutz_address: settings.plutz_address ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('settings.contracts.update'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Contract Settings
                    </h2>
                    <Link
                        href={route('settings.index')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        ← Back to Settings
                    </Link>
                </div>
            }
        >
            <Head title="Contract Settings" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Plutz Address
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                This value is used to replace the placeholder <code>[PLUTZ_ADDRESS]</code> in contract templates, signing, and PDFs.
                            </p>

                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                value={data.plutz_address}
                                onChange={(e) => setData('plutz_address', e.target.value)}
                                rows={5}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter the address to show in contracts..."
                            />
                            {errors.plutz_address && (
                                <div className="text-red-600 text-sm mt-1">{errors.plutz_address}</div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

