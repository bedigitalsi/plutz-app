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
        <AuthenticatedLayout className="bg-plutz-dark">
            <Head title="Contract Settings" />
            <div className="max-w-[1200px] mx-auto w-full p-6 pb-0">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-serif text-plutz-cream">Contract Settings</h2>
                    <Link href={route('settings.index')} className="text-plutz-tan hover:text-plutz-tan-light text-sm font-medium">Back to Settings</Link>
                </div>
            </div>


            <div className="max-w-[1200px] mx-auto w-full p-6">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="bg-plutz-surface overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <h3 className="text-lg font-medium text-plutz-cream mb-2">
                                Plutz Address
                            </h3>
                            <p className="text-sm text-stone-400 mb-4">
                                This value is used to replace the placeholder <code>[PLUTZ_ADDRESS]</code> in contract templates, signing, and PDFs.
                            </p>

                            <label className="block text-sm font-medium text-stone-400 mb-2">
                                Address
                            </label>
                            <textarea
                                value={data.plutz_address}
                                onChange={(e) => setData('plutz_address', e.target.value)}
                                rows={5}
                                className="w-full rounded-md border-plutz-tan/20 shadow-sm focus:border-plutz-tan focus:ring-plutz-tan"
                                placeholder="Enter the address to show in contracts..."
                            />
                            {errors.plutz_address && (
                                <div className="text-red-400 text-sm mt-1">{errors.plutz_address}</div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-plutz-tan text-plutz-dark rounded-md hover:bg-plutz-tan/90 disabled:opacity-50"
                            >
                                {processing ? 'Saving...' : 'Save Settings'}
                            </button>
                        </div>
                    </form>
                </div>
        </AuthenticatedLayout>
    );
}

